const SKELETON_ITEMS = [
  { depth: 0, width: "w-28" },
  { depth: 1, width: "w-36" },
  { depth: 1, width: "w-24" },
  { depth: 2, width: "w-32" },
  { depth: 0, width: "w-24" },
  { depth: 1, width: "w-28" },
  { depth: 1, width: "w-20" },
];

export function FoldersTreeSkeleton() {
  return (
    <div className="flex h-full flex-col p-2 select-none" aria-busy="true">
      <div className="animate-pulse space-y-0.5 py-1">
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
    </div>
  );
}
