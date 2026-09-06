import { z } from "zod";

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { workspaces, userWorkspaces } from "@/server/db/schema";
import { eq, and, exists } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
});
