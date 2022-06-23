import { Link } from "react-router-dom";
import { Board } from "dchan";
import IdLabel from "components/IdLabel";
import Loading from "components/Loading";
import { usePubSub } from "hooks";
import { useCallback } from "react";

function BoardItem({
  board, 
  block
}: {
  board: Board, 
  block?: number
}) {
  const { id, title, postCount, name, isLocked, isNsfw } = board

  const { publish } = usePubSub();

  const onMouseEnter = useCallback(() => {
    publish("BOARD_ITEM_HOVER_ENTER", board)
  }, [board, publish])

  const onMouseLeave = useCallback(() => {
    publish("BOARD_ITEM_HOVER_LEAVE", board)
  }, [board, publish])

  return (
    <tr className="relative" key={id} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <td>
        <IdLabel
          id={id}
        ></IdLabel>
      </td>
      <td className="px-2 whitespace-nowrap hidden sm:block max-w-12rem truncate">
        <span>
          <Link
            className="dchan-link"
            to={`/${name}/${id}${block ? `?block=${block}` : ""}`}
          >
            {title}
          </Link>
        </span>
      </td>
      <td className="px-2 whitespace-nowrap">
        <span>
          <Link
            className="dchan-link mx-4"
            to={`/${name}/${id}${block ? `?block=${block}` : ""}`}
          >
            /{name}/
          </Link>
        </span>
      </td>
      <td className="px-2 whitespace-nowrap text-right">
        <span>{postCount} posts</span>
      </td>
      <td className="left-full top-0 px-1 whitespace-nowrap center block">
        {isLocked ? (
          <span title="Board locked. You cannot post.">🔒</span>
        ) : (
          ""
        )}
        {isNsfw ? (
          <span title="NSFW Board">🔞</span>
        ) : (
          ""
        )}
      </td>
    </tr>
  )
}

export default function BoardList({
  className = "",
  loading = false,
  boards,
  block
}: {
  className?: string;
  loading?: boolean;
  boards?: Board[];
  block?: number;
}) {
  return (
    <div className={`${className} center`}>
      <table className="mx-8 border-separate">
        <tbody>
          {loading
            ? <Loading />
            : !boards ? "" : boards.length > 0
              ? boards.map(board => BoardItem({
                board, 
                block
              }))
              : "No boards"}
        </tbody>
      </table>
    </div>
  );
}
