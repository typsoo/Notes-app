import { z } from "zod";
import type { Block } from "@blocknote/core";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "@/server/api/trpc";
import { documents, documentSearch, folders } from "@/server/db/schema";
import { blocksToPlainText } from "@/features/search/lib/plain-text";
import { buildFolderPaths } from "@/features/search/lib/folder-paths";
import { escapeLikePattern, tokenizeQuery } from "@/features/search/lib/query";
import { makeSnippet } from "@/features/search/lib/snippet";

import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";

import { workspaceProcedure } from "@/server/api/middleware/workspace";

export const documentsRouter = createTRPCRouter({
  create: workspaceProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        content: z.custom<Block[]>((val) => Array.isArray(val)).default([]),
        folderId: z.uuid().nullable().optional(),
        isPinned: z.boolean().optional().default(false),
        isArchived: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.folderId) {
          const [folder] = await ctx.db
            .select({ id: folders.id })
            .from(folders)
            .where(
              and(
                eq(folders.id, input.folderId),
                eq(folders.workspaceId, input.workspaceId),
              ),
            );

          if (!folder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Folder not found.",
            });
          }
        }

        const [existingDocument] = await ctx.db
          .select({ id: documents.id })
          .from(documents)
          .where(
            and(
              eq(documents.workspaceId, input.workspaceId),
              input.folderId
                ? eq(documents.folderId, input.folderId)
                : isNull(documents.folderId),
              eq(documents.title, input.title),
            ),
          );

        if (existingDocument) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A document with this title already exists in this location.",
          });
        }

        const document = await ctx.db.transaction(async (tx) => {
          const [created] = await tx
            .insert(documents)
            .values({
              workspaceId: input.workspaceId,
              folderId: input.folderId ?? null,
              title: input.title,
              content: input.content,
              isPinned: input.isPinned,
              isArchived: input.isArchived,
            })
            .returning();

          if (!created) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create document.",
            });
          }

          await tx.insert(documentSearch).values({
            documentId: created.id,
            text: blocksToPlainText(input.content),
          });

          return created;
        });

        return document;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const cause =
          error instanceof Error && error.cause ? error.cause : error;

        if (
          typeof cause === "object" &&
          cause !== null &&
          "code" in cause &&
          cause.code === "23505"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A document with this title already exists in this location.",
            cause: error,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create document.",
          cause: error,
        });
      }
    }),

  getAll: workspaceProcedure.query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, input.workspaceId));
  }),

  search: workspaceProcedure
    .input(
      z.object({
        query: z.string().trim().min(2).max(200),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tokens = tokenizeQuery(input.query);

      if (tokens.length === 0) {
        return [];
      }

      const folderRows = await ctx.db
        .select({
          id: folders.id,
          parentId: folders.parentId,
          name: folders.name,
        })
        .from(folders)
        .where(eq(folders.workspaceId, input.workspaceId));

      const folderPaths = buildFolderPaths(folderRows);
      const folderIdsByToken = new Map<string, string[]>();

      for (const token of tokens) {
        const needle = token.toLowerCase();

        folderIdsByToken.set(
          token,
          folderRows
            .filter((folder) =>
              (folderPaths.get(folder.id) ?? "").toLowerCase().includes(needle),
            )
            .map((folder) => folder.id),
        );
      }

      const matchedFolderIds = [
        ...new Set([...folderIdsByToken.values()].flat()),
      ];

      const tokenConditions = tokens.map((token) => {
        const pattern = `%${escapeLikePattern(token)}%`;
        const folderIds = folderIdsByToken.get(token) ?? [];

        if (folderIds.length === 0) {
          return or(
            ilike(documents.title, pattern),
            ilike(documentSearch.text, pattern),
          );
        }

        return or(
          ilike(documents.title, pattern),
          ilike(documentSearch.text, pattern),
          inArray(documents.folderId, folderIds),
        );
      });

      const titlePrefix = `${escapeLikePattern(input.query)}%`;
      const titleContains = `%${escapeLikePattern(input.query)}%`;

      const rank = matchedFolderIds.length
        ? sql<number>`case
            when ${documents.title} ilike ${titlePrefix} then 0
            when ${documents.title} ilike ${titleContains} then 1
            when ${inArray(documents.folderId, matchedFolderIds)} then 2
            else 3
          end`
        : sql<number>`case
            when ${documents.title} ilike ${titlePrefix} then 0
            when ${documents.title} ilike ${titleContains} then 1
            else 3
          end`;

      const rows = await ctx.db
        .select({
          id: documents.id,
          title: documents.title,
          folderId: documents.folderId,
          text: documentSearch.text,
        })
        .from(documents)
        .leftJoin(documentSearch, eq(documentSearch.documentId, documents.id))
        .where(
          and(eq(documents.workspaceId, input.workspaceId), ...tokenConditions),
        )
        .orderBy(rank, desc(documents.updatedAt))
        .limit(50);

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        folderPath: row.folderId ? (folderPaths.get(row.folderId) ?? "") : "",
        snippet: makeSnippet(row.text ?? "", tokens, 100),
      }));
    }),

  getById: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.workspaceId, input.workspaceId),
          ),
        );

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      return document;
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
        title: z.string().min(1).max(256).optional(),
        content: z.custom<Block[]>((val) => Array.isArray(val)).optional(),
        folderId: z.uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, workspaceId, folderId, ...updateData } = input;

        if (folderId) {
          const [folder] = await ctx.db
            .select({ id: folders.id })
            .from(folders)
            .where(
              and(
                eq(folders.id, folderId),
                eq(folders.workspaceId, workspaceId),
              ),
            );

          if (!folder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Folder not found.",
            });
          }
        }

        const document = await ctx.db.transaction(async (tx) => {
          const [updated] = await tx
            .update(documents)
            .set({
              ...updateData,
              ...(folderId !== undefined ? { folderId } : {}),
            })
            .where(
              and(eq(documents.id, id), eq(documents.workspaceId, workspaceId)),
            )
            .returning();

          if (!updated) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Document not found.",
            });
          }

          if (input.content !== undefined) {
            const text = blocksToPlainText(input.content);

            await tx
              .insert(documentSearch)
              .values({ documentId: updated.id, text })
              .onConflictDoUpdate({
                target: documentSearch.documentId,
                set: { text },
              });
          }

          return updated;
        });

        return document;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const cause =
          error instanceof Error && error.cause ? error.cause : error;

        if (
          typeof cause === "object" &&
          cause !== null &&
          "code" in cause &&
          cause.code === "23505"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A document with this title already exists in this location.",
            cause: error,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create folder.",
          cause: error,
        });
      }
    }),

  delete: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .delete(documents)
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.workspaceId, input.workspaceId),
          ),
        )
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      return { success: true };
    }),

  togglePin: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
        isPinned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .update(documents)
        .set({ isPinned: input.isPinned })
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.workspaceId, input.workspaceId),
          ),
        )
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      return document;
    }),

  toggleArchive: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
        isArchived: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .update(documents)
        .set({ isArchived: input.isArchived })
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.workspaceId, input.workspaceId),
          ),
        )
        .returning();

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found.",
        });
      }

      return document;
    }),
});
