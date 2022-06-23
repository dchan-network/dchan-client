import { Post } from "dchan";
import { Link } from "react-router-dom";
import BoardLink from "./BoardLink";
import PostComponent from "./post/Post";

export default function PostSearchResult({ post, block }: { post: Post, block?: string }) {
  return (
    <div className="my-2" data-theme={post?.board?.isNsfw ? "nsfw" : "blueboard"}>
      <PostComponent
        key={post.id}
        post={post}
        block={block}
        header={
          <span>
            {post.board ? <span className="p-1 whitespace-nowrap">
              [
                <BoardLink board={post.board} block={block} />
              ]
            </span> : ""}
            <span className="p-1 whitespace-nowrap">
              [
              <Link
                to={`/${post.id}${block ? `?block=${block}` : ""}`}
                className="dchan-link inline"
              >
                View
              </Link>
              ]
            </span>
          </span>
        }
      />
    </div>
  );
}
