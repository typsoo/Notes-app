# Server-side document search with a derived plain-text projection

## Status

accepted

Documents store their body as BlockNote JSON, which SQL cannot match cleanly: `content::text` also matches block types, property keys, ids, and URLs, and Postgres full-text search fights typeahead (mid-word queries, stemming, mixed languages). Search therefore runs on the server and matches against a projection: a recursive walker flattens the body to plain text into a 1:1 `document_search` row on every content save, `pg_trgm` GIN indexes cover the projection and `documents.title`, and each whitespace token of the query must match as a case-insensitive substring in the title, body, or full folder path. Results rank title-prefix, then title-contains, then folder match, then body-only, with `updatedAt` as the tie-breaker.

The projection lives in its own table rather than a column on `documents` because `documents.getAll` selects whole rows and the workspace tree consumes it; a column would ship a second copy of every body to the client.

Considered and rejected: `content::text ILIKE` (false positives, no clean snippets) and `tsvector` / `ts_rank` / `ts_headline` (word-aware, but poor typeahead and still requires the derived text).

## Consequences

Search results lag edits by up to the editor's 5-second save debounce, and the projection must be backfilled after deployment. Title renames need no reindex because title remains a live column.
