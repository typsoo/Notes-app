import { z } from "zod";

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { workspaces, userWorkspaces } from "@/server/db/schema";
import { eq, and, exists } from "drizzle-orm";

export const worspacesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [workspace] = await tx
          .insert(workspaces)
          .values({
            name: input.name,
          })
          .returning();

        if (!workspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace.",
          });
        }

        await tx.insert(userWorkspaces).values({
          userId: ctx.session.user.id,
          workspaceId: workspace.id,
        });

        return workspace;
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .innerJoin(userWorkspaces, eq(workspaces.id, userWorkspaces.workspaceId))
      .where(eq(userWorkspaces.userId, ctx.session.user.id));
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .select({
          id: workspaces.id,
          name: workspaces.name,
        })
        .from(workspaces)
        .innerJoin(
          userWorkspaces,
          eq(workspaces.id, userWorkspaces.workspaceId),
        )
        .where(
          and(
            eq(workspaces.id, input.id),
            eq(userWorkspaces.userId, ctx.session.user.id),
          ),
        );

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found.",
        });
      }

      return workspace;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .update(workspaces)
        .set({
          name: input.name,
        })
        .where(
          and(
            eq(workspaces.id, input.id),
            exists(
              ctx.db
                .select()
                .from(userWorkspaces)
                .where(
                  and(
                    eq(userWorkspaces.workspaceId, workspaces.id),
                    eq(userWorkspaces.userId, ctx.session.user.id),
                  ),
                ),
            ),
          ),
        )
        .returning();

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found.",
        });
      }

      return workspace;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [workspace] = await ctx.db
        .delete(workspaces)
        .where(
          and(
            eq(workspaces.id, input.id),
            exists(
              ctx.db
                .select()
                .from(userWorkspaces)
                .where(
                  and(
                    eq(userWorkspaces.workspaceId, workspaces.id),
                    eq(userWorkspaces.userId, ctx.session.user.id),
                  ),
                ),
            ),
          ),
        )
        .returning();

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found.",
        });
      }

      return { success: true };
    }),
});
