import { useQuery } from "@apollo/react-hooks";
import ContentHeader from "components/ContentHeader";
import Footer from "components/Footer";
import { Board, Post, shortenAddress, Thread } from "dchan";
import THREAD_GET from "graphql/queries/thread_get";
import { DateTime } from "luxon";
import { parse as parseQueryString } from "query-string";
import { useEffect, useMemo } from "react";
import { Router } from "router";
import PostComponent from "components/post/Post";
import Loading from "components/Loading";
import Anchor from "components/Anchor";
import { usePubSub } from "hooks";
import { useHistory } from "react-router-dom";
import { useTitle } from "react-use";
import THREAD_GET_LAST_BLOCK from "graphql/queries/thread_get_last_block";

interface ThreadContentData {
  board: Board;
  threads: Thread[];
  posts: Post[];
}
interface ThreadContentVars {
  board: string;
  n: number;
  block?: number;
}

export default function ThreadPage({ location, match: { params } }: any) {
  let { board_name, board_id, user_id, thread_n } = params;
  board_id = board_id ? `0x${board_id}` : undefined;

  const history = useHistory();
  const { publish } = usePubSub();

  const query = parseQueryString(location.search);
  const block = parseInt(`${query.block}`);
  const dateTime = query.date
    ? DateTime.fromISO(query.date as string)
    : undefined;

  const focus_user_id = params.focus_user_id ? `0x${params.focus_user_id}` : "";
  const focus_post_n = params.focus_post_n || "";

  let variables = {
    board: board_id,
    n: thread_n,
    block,
  };

  const { refetch, data, loading } = useQuery<
    ThreadContentData,
    ThreadContentVars
  >(!!block ? THREAD_GET : THREAD_GET_LAST_BLOCK, {
    variables
  });

  const post = data?.posts?.[0];
  const thread = data?.threads?.[0];
  const board = data?.board;
  const posts = useMemo(
    () => (thread ? [thread.op, ...thread.replies] : []),
    [thread]
  );

  useEffect(() => {
    window.scrollTo({top: 0})
  }, [thread?.id])

  useEffect(() => {
    const url = !thread && post ? Router.post(post) : undefined;
    url && history.replace(`${url}${block ? `?block=${block}` : ""}`);
  }, [history, thread, block, post]);

  useEffect(() => {
    const filtered = !loading && (focus_user_id || focus_post_n)
      ? posts.filter(
        (post) => {
          const idCheck = (
            !focus_user_id
            || post.from.id === focus_user_id
            || `0x${shortenAddress(post.from.id).replace('-', '')}` === focus_user_id
          );
          const numCheck = (
            !focus_post_n
            || post.n === focus_post_n
          );
          return idCheck && numCheck;
        })
      : [];
    if (filtered.length === 1) {
      const post = filtered[0];
      // redirect to standard URL no matter what
      // if the real URL is invalid, it'll get replaced
      // if it's already in use, this will just raise a warning in the console
      history.replace(`${Router.post(post)}${block ? `?block=${block}` : ""}`);
      publish("POST_FOCUS", post);
    } else if (filtered.length > 1) {
      throw new Error("Somehow multiple posts were focused?");
    } else if (!loading && focus_user_id && focus_post_n) {
      history.replace(`/${focus_user_id}/${focus_post_n}`);
    }
  }, [posts, focus_user_id, focus_post_n, block, loading, publish, history]);

  useEffect(() => {
    // above useEffect will automatically redirect for focusing URLs
    // this will handle the normal case
    if (board && thread && (board_name !== board.name || user_id !== thread.op.from.id)) {
      const url = Router.thread(thread);
      url && history.replace(`${url}${block ? `?block=${block}` : ""}`);
    }
  }, [board, thread, board_name, user_id, history, block]);

  useEffect(() => {
    refetch({
      block,
    });
  }, [block, refetch]);

  useTitle(
    board && thread
      ? `/${board.name}/ - ${thread.subject || thread.op.comment
      } - dchan.network - [${thread.id}]`
      : `/${board_id}/ - Loading... - dchan.network`
  );

  return (
    <div className="bg-primary min-h-100vh flex flex-col" data-theme={board?.isNsfw ? "nsfw" : "blueboard"}>
      <ContentHeader
        board={board}
        thread={thread}
        dateTime={dateTime}
        baseUrl={thread ? Router.thread(thread) : location.pathname + location.hash}
        block={isNaN(block) ? undefined : `${block}`}
        summary={
          loading ? <span>...</span> : <span>Posts: {posts.length}</span>
        }
        onRefresh={refetch}
      />

      <div>
        {loading && !data ? (
          <div className="center grid">
            <Loading />
          </div>
        ) : posts && thread ? (
          <div>
            <div>
              {posts.map((post) => (
                <PostComponent
                  block={isNaN(block) ? undefined : `${block}`}
                  post={post}
                  thread={thread}
                  key={post.id}
                  enableBacklinks={true}
                  showNsfw={thread.board?.isNsfw}
                />
              ))}
            </div>

            <Anchor to="#board-header" label="Top" />
          </div>
        ) : (
          "Post not found."
        )}
      </div>

      <Footer showContentDisclaimer={!!posts && !!thread}></Footer>
    </div>
  );
}
