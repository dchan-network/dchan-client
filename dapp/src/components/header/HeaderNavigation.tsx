import { ApolloConsumer, ApolloClient, useQuery } from "@apollo/react-hooks";
import BoardLink from "components/BoardLink";
import { Board, Thread, Block } from "dchan";
import BOARDS_LIST_MOST_POPULAR from "graphql/queries/boards/list_most_popular";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { Router } from "router";
import TimeTravelWidget from "components/TimeTravelWidget";
import SearchWidget from "components/SearchWidget";
import WatchedThreadsWidget from "components/WatchedThreadsWidget";
import SettingsWidget from "components/SettingsWidget";
import OverlayComponent from "components/OverlayComponent";

interface BoardListData {
  boards: Board[];
}

interface BoardListVars { }

enum OpenedWidgetEnum {
  TIMETRAVEL = "TIMETRAVEL",
  SEARCH = "SEARCH",
  WATCHEDTHREADS = "WATCHEDTHREADS",
  SETTINGS = "SETTINGS",
}

const siteCreatedAtBlock: Block = {
  id: "0x04eeaa77c96947c5efca4abd8e3f8de005369390409d79dfef81aa983eb69e89",
  number: "17766365",
  timestamp: "1628450632"
};

const SettingsWidgetOverlay = OverlayComponent(SettingsWidget);

export default function HeaderNavigation({
  block,
  dateTime,
  board,
  thread,
  baseUrl,
  search,
}: {
  block?: string;
  dateTime?: DateTime;
  board?: Board;
  thread?: Thread;
  baseUrl?: string;
  search?: string;
}) {
  const [startBlock, setStartBlock] = useState<Block | undefined>();
  const [openedWidget, setOpenedWidget] = useState<OpenedWidgetEnum | null>(null);
  const timeTravelRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);
  const watchedThreadsRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setStartBlock(
      thread ? thread.createdAtBlock : board ? board.createdAtBlock : siteCreatedAtBlock
    );
  }, [thread, board, setStartBlock]);

  useEffect(() => {
    const listener = (event: any) => {
      const widgetRefs = [timeTravelRef, searchRef, watchedThreadsRef, settingsRef];
      if (widgetRefs.every(r => r.current && !r.current.contains(event.target))) {
        setOpenedWidget(null);
      }
    };

    document.addEventListener("mousedown", listener);
    //document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      //document.removeEventListener("touchstart", listener);
    };
  }, [timeTravelRef, searchRef, watchedThreadsRef, settingsRef])

  const { data } = useQuery<BoardListData, BoardListVars>(
    BOARDS_LIST_MOST_POPULAR,
    { variables: {}, pollInterval: 30_000 }
  );

  const boards = data?.boards;
  return (
    <div className="mb-8">
      <div className="text-sm p-1 border-solid border-bottom-secondary-accent bg-primary border-0 border-b-2 text-left fixed top-0 left-0 right-0 shadow-md z-50">
        [
        <Link
          className="dchan-link"
          to={`/${block ? `?block=${block}` : ""}`}
        >
          dchan.network
        </Link>
        ]
        <span className="text-black text-opacity-50">
          <span className="hidden sm:inline-block">
            [
            {!!boards &&
              boards.map((board) => (
                <span className="dchan-navigation-board" key={board.id}>
                  <wbr />
                  <BoardLink board={board} block={block} />
                </span>
              ))}
            ]
          </span>
          [
          <Link
            className="dchan-link"
            to={`${Router.boards()}${block ? `?block=${block}` : ""}`}
          >
            +
          </Link>
          ]
        </span>
        <span className="float-right flex flex-row">
          <ApolloConsumer>{(client: ApolloClient<any>) => (
            <TimeTravelWidget
              client={client}
              ref={timeTravelRef}
              open={openedWidget === OpenedWidgetEnum.TIMETRAVEL}
              onOpen={() => {
                setOpenedWidget(
                  openedWidget === OpenedWidgetEnum.TIMETRAVEL
                    ? null
                    : OpenedWidgetEnum.TIMETRAVEL
                );
              }}
              onClose={() => setOpenedWidget(null)}
              block={block}
              baseUrl={baseUrl || ""}
              startBlock={startBlock}
              dateTime={dateTime}
              startRangeLabel={
                thread ? "Thread creation" : board ? "Board creation" : "Site creation"
              }
            />
          )}</ApolloConsumer>
          <details className="w-full sm:relative mx-1" open={openedWidget === OpenedWidgetEnum.SEARCH} ref={searchRef}>
            <summary className="list-none cursor-pointer" onClick={(event) => {
              event.preventDefault();
              setOpenedWidget(
                openedWidget === OpenedWidgetEnum.SEARCH
                  ? null
                  : OpenedWidgetEnum.SEARCH
              );
            }}>
              🔍
            </summary>
            <div className="absolute w-screen sm:w-max top-7 sm:top-full sm:mt-1 left-0 right-0 sm:left-auto sm:right-0">
              <SearchWidget baseUrl={`${Router.posts()}${block ? `?block=${block}` : ""}`} search={search} />
            </div>
          </details>
          <details className="w-full sm:relative mx-1" open={openedWidget === OpenedWidgetEnum.WATCHEDTHREADS} ref={watchedThreadsRef}>
            <summary className="list-none cursor-pointer" onClick={(event) => {
              event.preventDefault();
              setOpenedWidget(
                openedWidget === OpenedWidgetEnum.WATCHEDTHREADS
                  ? null
                  : OpenedWidgetEnum.WATCHEDTHREADS
              );
            }}>
              👁
            </summary>
            <div className="absolute w-screen sm:w-max top-7 sm:top-full sm:mt-1 left-0 right-0 sm:left-auto sm:right-0">
              <WatchedThreadsWidget block={block}/>
            </div>
          </details>
          <span
            ref={settingsRef}
            className="cursor-pointer mx-1"
            onClick={() => {
              setOpenedWidget(
                openedWidget === OpenedWidgetEnum.SETTINGS
                  ? null
                  : OpenedWidgetEnum.SETTINGS
              );
            }}
          >
            ⚙️
            {openedWidget === OpenedWidgetEnum.SETTINGS ? (
              <SettingsWidgetOverlay
                onExit={() => setOpenedWidget(null)}
                overlayClassName="w-full sm:w-4/6 h-5/6"
              />
            ) : (
              ""
            )}
          </span>
        </span>
      </div>
    </div>
  );
}
