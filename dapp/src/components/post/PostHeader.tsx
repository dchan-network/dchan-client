import Menu from "components/Menu";
import Status from "components/Status";
import UserLabel from "components/UserLabel";
import { Post, sendTip, Thread } from "dchan";
import { fromBigInt } from "dchan/entities/datetime";
import { isLowScore } from "dchan/entities/post";
import {
  banPost,
  lockThread,
  pinThread,
  removePost,
  reportPost,
  unlockThread,
  unpinThread,
} from "dchan/operations";
import { usePubSub, useSettings, useUser, useWeb3, useFavorites } from "hooks";
import { DateTime } from "luxon";
import { ReactElement, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Router } from "router";
import { useTraveledBlock } from "components/TimeTravelWidget";

function DateDisplay({ post }: { post: Post }) {
  const createdAt = fromBigInt(post.createdAtBlock.timestamp);
  const traveledBlock = useTraveledBlock();
  const relativeTime = createdAt.toRelative();
  const base = traveledBlock ? fromBigInt(traveledBlock.timestamp) : undefined;
  const traveledRelativeTime =
    base && createdAt.diff(base).milliseconds
      ? createdAt.toRelative({
          base,
        })
      : "Now";
  const formattedDate = `${createdAt.toLocaleString({
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })}(${createdAt.weekdayShort})${createdAt.toLocaleString(
    DateTime.TIME_24_WITH_SECONDS
  )}`;

  return (
    <span
      className="px-0.5 whitespace-nowrap text-sm"
      title={relativeTime !== null ? relativeTime : undefined}
    >
      {formattedDate}
      <span className="text-xs px-1 opacity-20 hover:opacity-100 hidden sm:inline-block">
        [
        <Link
          title={`Time travel to ${formattedDate}`}
          to={`${Router.post(post)}?block=${post.createdAtBlock.number}`}
        >
          {traveledBlock ? (
            <span>
              {traveledRelativeTime} ({relativeTime})
            </span>
          ) : (
            relativeTime
          )}
        </Link>
        ]
      </span>
    </span>
  );
}

export default function PostHeader({
  post,
  thread,
  backlinks,
  block,
  children,
}: {
  post: Post;
  thread?: Thread;
  backlinks?: object;
  block?: string;
  children?: ReactElement;
}) {
  const {
    id,
    n,
    name,
    from: { address },
  } = post;
  const { provider, accounts } = useWeb3();
  const { publish } = usePubSub();
  const [settings] = useSettings();
  const { isJannyOf } = useUser();
  const isOwner = accounts.length > 0 && accounts[0] === address;
  const [status, setStatus] = useState<string | object>();

  const isJanny = thread?.board?.id ? isJannyOf(thread.board.id) : false;

  const replyTo = useCallback(
    (from: string, n: number | string) => {
      publish("FORM_QUOTE", { from, n });
    },
    [publish]
  );

  const onSendTip = useCallback(
    async (to: string, amount?: number) => {
      try {
        amount = amount
          ? amount
          : parseFloat(prompt("How much? (MATIC)") || "");
        if (isNaN(amount)) {
          alert("Invalid amount");
          return;
        }
        await sendTip(accounts[0], to, amount);
      } catch (e) {
        console.error({ onSendTipError: e });
      }
    },
    [accounts]
  );

  const isPinned = thread?.isPinned;
  const isLocked = thread?.isLocked;

  const isOp = id === thread?.id;
  const canPin = isOp && isJanny;
  const canRemove = isOwner || isJanny;
  const canBan = isJanny;
  const canLock = isOp && (isOwner || isJanny);
  const postBacklinks: Post[] = backlinks ? Object.values(backlinks) : [];

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = thread && isFavorite ? isFavorite(thread) : false;

  const onFavorite = useCallback(() => {
    if (thread && removeFavorite && addFavorite) {
      if (favorite) {
        removeFavorite(thread);
      } else {
        addFavorite(thread);
      }
    }
  }, [addFavorite, removeFavorite, thread, favorite]);

  return (
    <span className="max-w-95vw inline-flex flex-wrap items-center relative">
      {isOp && thread ? (
        <button
          className={`inline-block ${
            favorite
              ? "opacity-60 hover:opacity-80"
              : "opacity-20 hover:opacity-40"
          }`}
          title={favorite ? "Remove from watched" : "Add to watched"}
          onClick={onFavorite}
        >
          👁
        </button>
      ) : (
        <span></span>
      )}
      <span className="px-0.5 whitespace-nowrap">
        <span className="text-accent font-bold">
          {!name || "" === name ? "Anonymous" : name}
        </span>
      </span>
      <span className="px-1 whitespace-nowrap text-sm">
        (ID: <UserLabel user={post.from} />
        {provider && accounts && accounts[0] ? (
          <Menu>
            <div>
              <button
                className="dchan-link flex-grow opacity-50 hover:opacity-100"
                title="Send MATIC tip"
                onClick={() => onSendTip(address)}
              >
                💸 Send Tip
              </button>
            </div>
          </Menu>
        ) : (
          ""
        )}
        )
      </span>
      <DateDisplay post={post} />
      <span className="whitespace-nowrap">
        <span className="px-0.5 on-parent-target-font-bold text-sm whitespace-nowrap">
          <Link
            className="dchan-link"
            to={`${Router.post(post)}${block ? `?block=${block}` : ""}`}
            title="Link to this post"
          >
            No.
          </Link>
          <span
            className="dchan-link"
            title="Reply to this post"
            onClick={() => replyTo(post.from.id, post.n)}
          >
            {n}
          </span>
        </span>
        <span>
          {isOp && isPinned ? (
            <span title="Thread pinned. This might be important.">📌</span>
          ) : (
            <span></span>
          )}
          {isOp && isLocked ? (
            <span title="Thread locked. You cannot reply anymore.">🔒</span>
          ) : (
            <span></span>
          )}
          {isLowScore(post, settings?.content_filter?.score_threshold) ? (
            <span title="Post hidden due to reports. Click to show anyway.">
              ⚠️
            </span>
          ) : (
            <span></span>
          )}
        </span>
        <Menu>
          <div>
            <a
              href={`https://polygonscan.com/tx/${post.id}`}
              title="TX Details"
              target="_blank"
              rel="noreferrer"
            >
              🔍 TX Details
            </a>
          </div>
          <div>
            <Link
              to={`${Router.post(post)}?block=${post.createdAtBlock.number}`}
            >
              ⏱️ Time travel to
            </Link>
          </div>
          {accounts && accounts[0] ? (
            <div>
              {canLock ? (
                <div>
                  {thread && thread.isLocked ? (
                    <span>
                      <input name="lock" type="hidden" value="false"></input>
                      <button
                        onClick={() => unlockThread(id, accounts, setStatus)}
                      >
                        🔓 Unlock
                      </button>
                    </span>
                  ) : (
                    <span>
                      <input name="lock" type="hidden" value="true"></input>
                      <button
                        onClick={() => lockThread(id, accounts, setStatus)}
                      >
                        🔒 Lock
                      </button>
                    </span>
                  )}
                </div>
              ) : (
                ""
              )}
              {canPin ? (
                <div>
                  {thread && thread.isPinned ? (
                    <span>
                      <input name="sticky" type="hidden" value="false"></input>
                      <button
                        onClick={() => unpinThread(id, accounts, setStatus)}
                      >
                        📌 Unpin
                      </button>
                    </span>
                  ) : (
                    <span>
                      <input name="sticky" type="hidden" value="true"></input>
                      <button
                        onClick={() => pinThread(id, accounts, setStatus)}
                      >
                        📌 Pin
                      </button>
                    </span>
                  )}
                </div>
              ) : (
                ""
              )}
              {canRemove ? (
                <div>
                  <button onClick={() => removePost(id, accounts, setStatus)}>
                    ❌ Remove
                  </button>
                </div>
              ) : (
                ""
              )}
              {canBan ? (
                <div>
                  <button onClick={() => banPost(id, accounts, setStatus)}>
                    🔫 Ban
                  </button>
                </div>
              ) : (
                ""
              )}
              <div>
                <button onClick={() => reportPost(id, accounts, setStatus)}>
                  ⚠️ Report
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
        </Menu>
      </span>
      {children}
      <span className="dchan-backlinks text-left text-sm flex flex-wrap">
        {postBacklinks?.map((post) => (
          <Link
            className="dchan-link px-1"
            to={`${Router.post(post)}${block ? `?block=${block}` : ""}`}
            onMouseEnter={() => publish("POST_HIGHLIGHT", post.id)}
            onMouseLeave={() => publish("POST_DEHIGHLIGHT", post.id)}
            key={post.id}
          >
            {`>>${post.n}`}
          </Link>
        ))}
      </span>
      <Status status={status}></Status>
    </span>
  );
}
