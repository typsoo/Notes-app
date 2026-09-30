import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@/server/api/root";

function isUnauthorized(error: unknown) {
  return (
    isTRPCClientError<AppRouter>(error) && error.data?.code === "UNAUTHORIZED"
  );
}

function redirectUnauthorized(error: unknown) {
  if (
    typeof window === "undefined" ||
    !isUnauthorized(error) ||
    window.location.pathname === "/login"
  ) {
    return;
  }

  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.replace(loginUrl);
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({ onError: redirectUnauthorized }),
    mutationCache: new MutationCache({ onError: redirectUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: (failureCount, error) =>
          !isUnauthorized(error) && failureCount < 3,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
