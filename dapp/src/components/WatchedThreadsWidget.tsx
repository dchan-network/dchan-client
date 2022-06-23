import { useQuery } from "@apollo/react-hooks";
import { useThrottleCallback } from "@react-hook/throttle";
import { Thread } from "dchan";
import THREADS_LIST_FAVORITES from "graphql/queries/threads/list_favorites";
import { useFavorites } from "hooks";
import { truncate } from "lodash";
import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Router } from "router";
import BoardLink from "./BoardLink";
import Loading from "./Loading";

export default function WatchedThreadsWidget({ block }: { block?: string }) {
  const { favorites, removeFavorite } = useFavorites();
  const ids = useMemo(
    () => (favorites ? Object.keys(favorites) : []),
    [favorites]
  );

  const { data, loading, refetch } = useQuery(THREADS_LIST_FAVORITES, {
    pollInterval: 30_000,
    variables: {
      ids,
    },
    skip: !favorites,
  });

  const threads = data?.threads;
  const doRefetch = useCallback(() => refetch({ ids }), [refetch, ids]);
  const onRefresh = useThrottleCallback(doRefetch, 1, true);
  const onRemove = removeFavorite ? removeFavorite : () => { };

  return favorites ? (
    <div className="bg-primary border border-secondary-accent p-1">
      {loading ? (
        <Loading />
      ) : ids.length > 0 && threads && threads.length > 0 ? (
        <div>
          <div className="mb-2">Watched threads: 
            <span className="text-xs pl-2">
              [
              <button
                className="dchan-link"
                onClick={onRefresh}
              >
                Refresh
              </button>
              ]
            </span>
          </div>
          <div className="text-sm">
            {threads.map((thread: Thread) => {
              const board = thread.board;

              return (
                <div key={thread.id}>
                  <button onClick={() => onRemove(thread)}>✖</button>{" "}
                  {board ? (
                    <span>
                      <BoardLink board={board} block={block} />
                    </span>
                  ) : (
                    ""
                  )}
                  <Link
                    className="dchan-link"
                    to={`${Router.thread(thread)}`}
                  >
                    {" "}
                    - ({thread.replyCount}) -{" "}
                    {truncate(thread.subject || thread.op.comment, {
                      length: 32,
                    })}{" "}
                    {thread.isLocked ? "🔒" : ""}{" "}
                    {thread.isPinned ? "📌" : ""}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        "No threads are being watched. Use the 👁 button on threads to keep track of them here."
      )}
    </div>
  ) : (
    <div className="bg-primary border border-secondary-accent p-1">
      ...
    </div>
  );
}
