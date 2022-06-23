import { Thread } from "dchan";
import IPFSImage from "components/IPFSImage";
import PostBody from "components/post/PostBody";
import { isLowScore as isLowScoreThread } from "dchan/entities/thread";
import { useSettings } from "hooks";
import { useHistory } from "react-router-dom";
import { Router } from "router";
import { DateTime } from "luxon";
import { useState, useCallback } from "react";
import BoardLink from "components/BoardLink";

const CatalogThread = ({
  thread,
  block,
  showBoard = false,
}: {
  thread: Thread;
  block?: number;
  showBoard?: boolean;
}) => {
  const {
    id,
    isPinned,
    isLocked,
    subject,
    op,
    replyCount,
    imageCount,
    replies,
    board,
  } = thread;
  const { image } = op;
  const { ipfsHash, isNsfw, isSpoiler } = image || {
    ipfsHash: "",
    isNsfw: false,
    isSpoiler: false,
  };

  const imgClassName =
    "w-full pointer-events-none shadow-xl object-contain max-h-320px";
  const [settings] = useSettings();
  const isLowScore = isLowScoreThread(
    thread,
    settings?.content_filter?.score_threshold
  );

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const history = useHistory();

  const openThread = useCallback(
    () => {
      const url = Router.thread(thread);
      url && history.push(`${url}${block ? `?block=${block}` : ""}`);
    },
    [thread, history, block]
  );

  const focusThread = useCallback(
    () => {
      setIsFocused(true);
    },
    [setIsFocused]
  );

  const defocusThread = useCallback(
    () => {
      setIsFocused(false);
    },
    [setIsFocused]
  );

  return (
    <div className="relative max-w-150px mx-1 w-full" style={{minHeight: "20rem"}}>
      <article
        id={id}
        className="dchan-post justify-self-center text-decoration-none leading-4 text-black m-0.5 border-black overflow-hidden max-w-150px break-word w-full place-items-center flex"
        style={
          isFocused
            ? {
                maxWidth: "initial",
                zIndex: 40,
                marginLeft: "-2rem",
                marginRight: "-2rem",
                width: "14rem",
                position: "absolute",
              }
            : {
                minHeight: "20rem",
                position: "relative",
              }
        }
        onMouseEnter={focusThread}
        onMouseLeave={defocusThread}
      >
        {isLowScore && !isFocused ? (
          <button
            onClick={focusThread}
            className="absolute text-2xl text-gray-800 top-0 left-0 right-0 bottom-0"
          >
            <div>⚠️</div>
            <div>Post hidden due to reports.</div>
            <div className="text-sm text-gray-600">Click to show anyway.</div>
          </button>
        ) : (
          ""
        )}
        <button
          className="h-full w-full"
          onClick={openThread}
        >
          <div
            className={[
              !isFocused ? "absolute top-0 right-0 left-0" : "relative top-0 z-10 bg-tertiary border border-black h-full",
              !isFocused && isLowScore ? "dchan-censor" : "",
            ].join(" ")}
            style={{maxHeight: "initial"}}
          >
            <div className="absolute top-0 right-0 z-10">
              {isPinned ? (
                <span title="Thread pinned. This might be important.">📌</span>
              ) : (
                ""
              )}
              {isLocked ? (
                <span title="Thread locked. You cannot post.">🔒</span>
              ) : (
                ""
              )}
            </div>
            {ipfsHash && (!isLowScore || isFocused) ? (
              <div>
                <IPFSImage
                  className={imgClassName}
                  hash={ipfsHash}
                  expandable={false}
                  thumbnail={false}
                  isSpoiler={isSpoiler}
                  isNsfw={(isNsfw && !thread.board?.isNsfw) || false}
                />
              </div>
            ) : (
              ""
            )}
            <div className="p-1">
              {showBoard && board ? (
                <div>
                  <BoardLink board={board} block={block == null ? undefined : `${block}`} />
                </div>
              ) : (
                ""
              )}
              <div>
                <abbr title="Replies">R</abbr>: <strong>{replyCount}</strong>, <abbr title="Images">I</abbr>: <strong>{imageCount}</strong>
              </div>
              <div className="word-wrap">
                <div>
                  <strong className="text-url">{subject}</strong>
                </div>
                <PostBody
                  style={{
                    minWidth: isFocused ? "12rem" : "initial",
                    textAlign: "center",
                  }}
                  post={op}
                />
                {isFocused &&
                  replies &&
                  [...replies].reverse().map((post) => (
                    <div
                      className="mt-1 p-1 border-0 border-t border-black border-solid text-xs text-left"
                      key={post.id}
                    >
                      <div>
                        {DateTime.fromSeconds(
                          parseInt(post.createdAtBlock.timestamp)
                        ).toRelative()}
                      </div>
                      <PostBody post={post} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </button>
      </article>
    </div>
  );
};

export default CatalogThread;
