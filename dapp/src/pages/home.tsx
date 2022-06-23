import Card from "components/Card";
import Footer from "components/Footer";
import HeaderNavigation from "components/header/HeaderNavigation";
import LatestPostsCard from "components/LatestPostsCard";
import PopularThreadsCard from "components/PopularThreadsCard";
import WatchedThreadsCard from "components/WatchedThreadsCard";
import { parse as parseQueryString } from "query-string";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState } from "react";
import { useTitle } from "react-use";
import { subscribe, unsubscribe } from "pubsub-js";
import HeaderLogo from "components/header/logo";
import PopularBoardsCard from "components/PopularBoardsCard";
import { Board } from "dchan";
import BoardLink from "components/BoardLink";

export default function HomePage({ location }: any) {
  useTitle("dchan.network");

  const [board, setBoard] = useState<Board>();
  const query = parseQueryString(location.search);
  const block = parseInt(`${query.block}`);
  const queriedBlock = isNaN(block) ? undefined : block;
  const dateTime = query.date
    ? DateTime.fromISO(query.date as string)
    : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const sub = subscribe("BOARD_ITEM_HOVER_ENTER", (_: any, hoverBoard: Board) => {
      setBoard(hoverBoard);
    })

    return () => unsubscribe(sub);
  }, [setBoard]);

  const onPopularBoardsMouseLeave = useCallback(() => {
    setBoard(undefined)
  }, [setBoard])

  return (
    <div className="h-screen bg-primary flex flex-col pb-8">
      <HeaderNavigation
        baseUrl="/"
        block={queriedBlock ? `${queriedBlock}` : undefined}
        dateTime={dateTime}
      />
      <HeaderLogo />
      <div className="flex flex-col grid-cols-3 xl:grid px-4">
        <div className="w-full px-2 pb-2">
          <Card
            title={<span>Popular Boards</span>}
            className="md:px-1 w-full pb-4"
          >
            <div onMouseLeave={onPopularBoardsMouseLeave}>
              <PopularBoardsCard block={queriedBlock} />
            </div>
          </Card>
          <Card
            title={<span>Watched Threads</span>}
            className="md:px-1 w-full pb-4"
          >
            <WatchedThreadsCard block={queriedBlock} />
          </Card>
        </div>
        <Card title={<span>Latest Posts {board ? <span>on <BoardLink board={board} block={block == null ? undefined : `${block}`} /></span> : ""}</span>} className="w-full px-2 pb-2">
          <LatestPostsCard block={queriedBlock} board={board} />
        </Card>
        <Card
          title={<span>Popular Threads {board ? <span>on <BoardLink board={board} block={block == null ? undefined : `${block}`} /></span> : ""}</span>}
          className="md:px-1 w-full pb-4"
        >
          <PopularThreadsCard block={queriedBlock} board={board} />
        </Card>
      </div>
      <Footer />
    </div>
  );
}
