import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/better-auth/config";

// Route all incoming Better Auth requests to the auth engine
export const { GET, POST } = toNextJsHandler(auth.handler);