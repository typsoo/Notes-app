import { z } from "zod";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "@/server/api/trpc";
import { folders } from "@/server/db/schema";

import { eq, and, isNull, sql } from "drizzle-orm";

import { workspaceProcedure } from "@/server/api/middleware/workspace";

export const foldersRouter = createTRPCRouter({
  create: workspaceProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        parentId: z.uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (input.parentId) {
          const [parentFolder] = await ctx.db
            .select({ id: folders.id })
            .from(folders)
            .where(
              and(
                eq(folders.id, input.parentId),
                eq(folders.workspaceId, input.workspaceId),
              ),
            );

          if (!parentFolder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent folder not found.",
            });
          }
        }

        const [folder] = await ctx.db
          .insert(folders)
          .values({
            workspaceId: input.workspaceId,
            parentId: input.parentId ?? null,
            name: input.name,
          })
          .returning();

        if (!folder) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create folder.",
          });
        }

        return folder;
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
            message: "A folder with this name already exists in this location.",
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

  getAll: workspaceProcedure
    .input(
      z
        .object({
          parentId: z.uuid().nullable().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(folders.workspaceId, input.workspaceId)];

      if (input?.parentId !== undefined) {
        if (input.parentId === null) {
          conditions.push(isNull(folders.parentId));
        } else {
          conditions.push(eq(folders.parentId, input.parentId));
        }
      }

      return ctx.db
        .select()
        .from(folders)
        .where(and(...conditions));
    }),

  getById: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [folder] = await ctx.db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, input.id),
            eq(folders.workspaceId, input.workspaceId),
          ),
        );

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found.",
        });
      }

      return folder;
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: z.uuid(),
        name: z.string().min(1).max(256).optional(),
        parentId: z.uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, workspaceId, parentId, name } = input;

        if (parentId !== undefined) {
          if (parentId === id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A folder cannot be its own parent.",
            });
          }

          if (parentId !== null) {
            const [parentFolder] = await ctx.db
              .select({ id: folders.id, parentId: folders.parentId })
              .from(folders)
              .where(
                and(
                  eq(folders.id, parentId),
                  eq(folders.workspaceId, workspaceId),
                ),
              );

            if (!parentFolder) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Parent folder not found.",
              });
            }

            const [cycle] = await ctx.db.execute<{
              exists: boolean;
            }>(sql`                
                WITH RECURSIVE ancestors AS (                                               
                  SELECT id, parent_id                                                      
                  FROM "final-notes-app_folders"                                            
                  WHERE id = ${parentId} AND workspace_id = ${workspaceId}                  
                                                                                            
                  UNION ALL                                                                 
                                                                                            
                  SELECT f.id, f.parent_id                                                     
                  FROM "final-notes-app_folders" f                                          
                  INNER JOIN ancestors a ON f.id = a.parent_id
                                                 
                )                                                                           
                SELECT true AS exists                                                       
                FROM ancestors                                                              
                WHERE id = ${id}                                                            
                LIMIT 1;                                                                    
    `);

            if (cycle?.exists) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Cannot move a folder into one of its descendants.",
              });
            }
          }

          const [folder] = await ctx.db
            .update(folders)
            .set({
              ...(name !== undefined ? { name } : {}),
              ...(parentId !== undefined ? { parentId } : {}),
            })
            .where(
              and(eq(folders.id, id), eq(folders.workspaceId, workspaceId)),
            )
            .returning();

          if (!folder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Folder not found.",
            });
          }

          return folder;
        }
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
            message: "A folder with this name already exists in this location.",
            cause: error,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update folder.",
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
      const [folder] = await ctx.db
        .delete(folders)
        .where(
          and(
            eq(folders.id, input.id),
            eq(folders.workspaceId, input.workspaceId),
          ),
        )
        .returning();

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found.",
        });
      }

      return { success: true };
    }),
});

export const routerFolders = foldersRouter;
