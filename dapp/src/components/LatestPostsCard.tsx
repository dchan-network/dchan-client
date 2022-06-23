import { useQuery } from "@apollo/react-hooks";
import { Board, Post } from "dchan";
import POSTS_GET_LAST from "graphql/queries/posts_get_last";
import POSTS_GET_LAST_BLOCK from "graphql/queries/posts_get_last_block";
import Loading from "./Loading";
import PostSearchResult from "./PostSearchResult";

export default function LatestPostsCard({block, board}: {block?: number, board?: Board}) {
  const query = block ? POSTS_GET_LAST_BLOCK : POSTS_GET_LAST
  const { loading, data } = useQuery<{ posts: Post[] }, any>(query, {
    pollInterval: 5_000,
    variables: {
      block,
      board: board?.id || ""
    }
  });

  return (
    <div>
      {loading && !data ? (
        <Loading />
      ) : (
        data?.posts?.map((post) => <PostSearchResult post={post} key={post.id} block={block ? `${block}` : undefined} />)
      )}
    </div>
  );
}
