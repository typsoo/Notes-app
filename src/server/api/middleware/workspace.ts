import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { userWorkspaces } from "@/server/db/schema";
import { protectedProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";

const workspaceInput = z.object({
  workspaceId: z.uuid(),
});

export const workspaceProcedure = protectedProcedure
  .input(workspaceInput)
  .use(async ({ ctx, input, next }) => {
    const [membership] = await ctx.db
      .select({ workspaceId: userWorkspaces.workspaceId })
      .from(userWorkspaces)
      .where(
        and(
          eq(userWorkspaces.workspaceId, input.workspaceId),
          eq(userWorkspaces.userId, ctx.session.user.id),
        ),
      );

    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found.",
      });
    }

    return next();
  });
