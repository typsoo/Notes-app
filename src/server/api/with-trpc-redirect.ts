import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";

export async function withTrpcRedirects<T>(
  callback: () => Promise<T>,
): Promise<T> {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof TRPCError) {
      switch (error.code) {
        case "UNAUTHORIZED":
          redirect("/login");
        case "NOT_FOUND":
        case "BAD_REQUEST":
          notFound();
      }
    }
    throw error;
  }
}
