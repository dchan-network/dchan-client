import { Thread } from "dchan";
import CatalogThread from "./catalog/CatalogThread";

export default function CatalogView({
  threads,
  block,
  showBoard = false
}: {
  threads: Thread[];
  block?: number,
  showBoard?: boolean
}) {
  return (
    <div className="flex flex-row flex-wrap justify-center place-items-start font-size-090rem px-2 sm:px-4">
      {threads.filter(t => !!t && !!t.board).map(thread => (
        <CatalogThread
          thread={thread}
          key={thread.id}
          block={block}
          showBoard={showBoard}
        />
      ))}
    </div>
  );
}
