import Footer from "components/Footer";
import { useLastBlock, useSettings } from "hooks";
import { parse as parseQueryString } from "query-string";
import { DateTime } from "luxon";
import { Board, BoardRef, Thread } from "dchan";
import { useEffect, useMemo } from "react";
import { Router } from "router";
import BOARD_CATALOG from "graphql/queries/board_catalog";
import BOARD_GET from "graphql/queries/boards/get";
import { useQuery } from "@apollo/react-hooks";
import { isLowScore } from "dchan/entities/thread";
import ContentHeader from "components/ContentHeader";
import Loading from "components/Loading";
import Anchor from "components/Anchor";
import CatalogView from "components/CatalogView";
import IndexView from "components/IndexView";
import { Link, useHistory } from "react-router-dom";
import { useTitle } from "react-use";

interface BoardCatalogData {
  board: Board;
  pinned: Thread[];
  threads: Thread[];
}
interface BoardCatalogVars {
  board: string;
  block: number;
  limit: number;
  skip: number;
}

interface BoardData {
  board: Board;
  boardRef: BoardRef;
}
interface BoardVars {
  board: string;
  block: number;
}

export default function BoardPage({ location, match: { params } }: any) {
  let { board_id, board_name } = params;
  board_id = board_id ? `0x${board_id}` : undefined;

  const { lastBlock } = useLastBlock();
  const query = parseQueryString(location.search);
  const page = parseInt(`${query.page || "1"}`);
  const queriedBlock = parseInt(`${query.block}`);
  const block = !isNaN(queriedBlock)
    ? queriedBlock
    : parseInt(`${lastBlock?.number || "0"}`);
  const dateTime = query.date
    ? DateTime.fromISO(query.date as string)
    : undefined;

  const history = useHistory();
  const [settings] = useSettings();
  const boardMode: string = params.view_mode || settings?.content_view?.board_default_view_mode || "catalog"
  const orderBy =
    settings?.content_view?.board_sort_threads_by || "lastBumpedAt";
  const limit = parseInt(`${settings?.content_view?.page_size || "100"}`);

  const variables = {
    board: board_id,
    block,
    orderBy,
    orderDirection: settings?.content_view?.board_sort_direction || "desc",
    limit,
    skip: limit * (page-1),
  };

  const { refetch, data: catalogData, loading: catalogLoading } = useQuery<
    BoardCatalogData,
    BoardCatalogVars
  >(BOARD_CATALOG, {
    variables
  });

  const { loading: boardLoading, data: boardData } = useQuery<
    BoardData,
    BoardVars
  >(BOARD_GET, {
    skip: !block,
    variables: {
      board: board_id,
      block
    }
  });

  const board: Board | undefined | null = boardData?.board;
  const boardRef: BoardRef | undefined | null = boardData?.boardRef;
  const threads = useMemo(
    () => [...(catalogData?.pinned || []), ...(catalogData?.threads || [])],
    [catalogData]
  );

  useEffect(() => {
    window.scrollTo({top: 0})
  }, [board?.id])

  useEffect(() => {
    board && board.name !== board_name && history.replace(`/${board.id}`);
  }, [board, board_name, history])

  useEffect(() => {
    !board && boardRef?.board?.id && history.replace(`/${boardRef.board.id}`);
  }, [board, boardRef, history])

  useEffect(() => {
    refetch();
  }, [block, orderBy, refetch]);

  const filteredThreads = (threads || []).filter((thread: Thread) => {
    return (
      settings?.content_filter?.show_below_threshold ||
      !isLowScore(thread, settings?.content_filter?.score_threshold)
    );
  });

  // @TODO usePagination?
  const maxPage = useMemo(() => {
    const threadCount = parseInt(`${board?.threadCount || 0}`)
    return Math.max(
      Math.ceil(board ? threadCount / limit : 0),
    1)
  }, [board, limit]);

  useTitle(
    !boardLoading
      ? board
        ? `/${board.name}/ - dchan.network - [${board.id}]`
        : `??? - dchan.network - [${board_id}]`
      : `Loading... - dchan.network - [${board_id}]`
  );

  return (
    <div className="bg-primary min-h-100vh flex flex-col" data-theme={board?.isNsfw ? "nsfw" : "blueboard"}>
      <div>
        <ContentHeader
          board={board}
          dateTime={dateTime}
          baseUrl={board ? Router.board(board, boardMode) : location.pathname + location.hash}
          block={isNaN(queriedBlock) ? undefined : `${queriedBlock}`}
          summary={
            catalogLoading ? (
              <span>...</span>
            ) : (
              <span>
                Threads: {threads.length} (Hidden:{" "}
                {threads.length - filteredThreads.length}
                ), Posts: {board?.postCount}
              </span>
            )
          }
          onRefresh={refetch}
        />
        <div>
          {board === null ? (
            <div className="center grid p-8">
              Board does not exist.
              {!isNaN(queriedBlock) ? <>
                <br/>
                You may have time traveled to before it was created, or after it was deleted.
              </> : ""}
            </div>
          ) : catalogLoading && !catalogData ? (
            <div className="center grid">
              <Loading />
            </div>
          ) : board && threads ? (
            threads.length === 0 ? (
              <div className="center grid p-8">
                No threads.
              </div>
            ) : (
              <div>
                {
                  {
                    catalog: (
                      <CatalogView
                        threads={filteredThreads}
                        block={queriedBlock}
                      />
                    ),
                    index: (
                      <IndexView
                        threads={filteredThreads}
                        block={queriedBlock}
                      />
                    ),
                  }[boardMode]
                }
              </div>
            )
          ) : (
            <div />
          )}

          {board ? (
            <div>
              <hr/>
              <div className="p-2">
                <span>
                  {page > 1 ? (
                    <Link
                      className="dchan-link px-2"
                      to={`${Router.board(board, boardMode)}?page=1${
                        queriedBlock ? `&block=${queriedBlock}` : ""
                      }`}
                    >
                      &lt;&lt;
                    </Link>
                  ) : (
                    ""
                  )}
                </span>
                <span>
                  {page > 1 ? (
                    <Link
                      className="dchan-link px-2"
                      to={`${Router.board(board, boardMode)}?page=${page - 1}${
                        queriedBlock ? `&block=${queriedBlock}` : ""
                      }`}
                    >
                      &lt;
                    </Link>
                  ) : (
                    ""
                  )}
                </span>
                <span>
                  [
                  <button
                    className="dchan-link px-2"
                    onClick={() => {
                      const input = prompt(
                        `Page number: (range: 1-${maxPage})`
                      );
                      const newPage = parseInt(input || "");
                      if (isNaN(newPage) || newPage < 1 || newPage > (maxPage)) {
                        alert(`Invalid page number: ${input}`);
                      } else {
                        history.push(
                          `${Router.board(board, boardMode)}?page=${newPage}${
                            queriedBlock ? `&block=${queriedBlock}` : ""
                          }`
                        );
                      }
                    }}
                  >
                    Page {page} of {maxPage}
                  </button>
                  ]
                </span>
                <span>
                  {page < maxPage ? (
                    <Link
                      className="dchan-link px-2"
                      to={`${Router.board(board, boardMode)}?page=${page + 1}${
                        queriedBlock ? `&block=${queriedBlock}` : ""
                      }`}
                    >
                      &gt;
                    </Link>
                  ) : (
                    ""
                  )}
                </span>
                <span>
                  {page < maxPage ? (
                    <Link
                      className="dchan-link px-2"
                      to={`${Router.board(board, boardMode)}?page=${maxPage}${
                        queriedBlock ? `&block=${queriedBlock}` : ""
                      }`}
                    >
                      &gt;&gt;
                    </Link>
                  ) : (
                    ""
                  )}
                </span>
              </div>

              <Anchor to="#board-header" label="Top" />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      <Footer showContentDisclaimer={true}></Footer>
    </div>
  );
}
