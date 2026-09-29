import { z } from "zod";
import type { Block } from "@blocknote/core";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "@/server/api/trpc";
import { documents, folders } from "@/server/db/schema";

import { eq, and, isNull } from "drizzle-orm";

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

        const [document] = await ctx.db
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

        if (!document) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create document.",
          });
        }

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

        const [document] = await ctx.db
          .update(documents)
          .set({
            ...updateData,
            ...(folderId !== undefined ? { folderId } : {}),
          })
          .where(
            and(eq(documents.id, id), eq(documents.workspaceId, workspaceId)),
          )
          .returning();

        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found.",
          });
        }

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
