import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
});
