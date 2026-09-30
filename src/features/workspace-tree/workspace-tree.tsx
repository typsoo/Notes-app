import { api } from "@/trpc/server";
import { buildTreeItems } from "./utils/tree-transform";
import { TreeView } from "./components/tree-view";
import { withTrpcRedirects } from "@/server/api/with-trpc-redirect";

interface WorkspaceTreeProps {
  workspaceId: string;
}

export function WorkspaceTree({ workspaceId }: WorkspaceTreeProps) {
  return <WorkspaceTreeContent workspaceId={workspaceId} />;
}

async function WorkspaceTreeContent({ workspaceId }: { workspaceId: string }) {
  const [folders, documents] = await withTrpcRedirects(() =>
    Promise.all([
      api.folders.getAll({ workspaceId }),
      api.documents.getAll({ workspaceId }),
    ]),
  );

  const items = buildTreeItems(folders, documents);
  return <TreeView items={items} workspaceId={workspaceId} />;
}

const SKELETON_ITEMS = [
  { depth: 0, width: "w-28" },
  { depth: 1, width: "w-36" },
  { depth: 1, width: "w-24" },
  { depth: 2, width: "w-32" },
  { depth: 0, width: "w-24" },
  { depth: 1, width: "w-28" },
  { depth: 1, width: "w-20" },
];

export function WorkspaceTreeSkeleton() {
  return (
    <div className="animate-pulse space-y-0.5 py-1" aria-busy="true">
      {SKELETON_ITEMS.map((item, index) => (
        <div
          key={index}
          style={{ paddingLeft: `${item.depth * 14 + 6}px` }}
          className="flex h-7 items-center gap-1.5 rounded-md pr-2"
        >
          <div className="bg-muted size-4 shrink-0 rounded" />
          <div className={`bg-muted h-3.5 rounded ${item.width}`} />
        </div>
      ))}
    </div>
  );
}
