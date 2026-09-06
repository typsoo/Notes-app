import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { documents } from "@/server/db/schema";

import { eq, and } from "drizzle-orm";

import { workspaceProcedure } from "@/server/api/middleware/workspace";

export const documentsRouter = createTRPCRouter({
  create: workspaceProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        content: z.string().default(""),
        isPinned: z.boolean().optional().default(false),
        isArchived: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const [document] = await ctx.db
          .insert(documents)
          .values({
            workspaceId: input.workspaceId,
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
        if (error instanceof TRPCError) throw error;

        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "23505"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A document with this title already exists in this workspace.",
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
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, workspaceId, ...updateData } = input;

        const [document] = await ctx.db
          .update(documents)
          .set(updateData)
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
        if (error instanceof TRPCError) throw error;

        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "23505"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A document with this title already exists in this workspace.",
            cause: error,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update document.",
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
