import { ApolloQueryResult, ApolloClient } from "@apollo/react-hooks";
import { Block } from "dchan";
import { fromBigInt } from "dchan/entities/datetime";
import BLOCK_BY_DATE from "graphql/queries/block_by_date";
import BLOCK_BY_NUMBER from "graphql/queries/block_by_number";
import { useLastBlock } from "hooks";
import { DateTime } from "luxon";
import { useCallback, useEffect, useState, useMemo, forwardRef, ForwardedRef } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { singletonHook } from "react-singleton-hook";

export interface TimeTravelRange {
  min: Block;
  max: Block;
}

interface BlockData {
  blocks: Block[];
}
interface BlockByDateVars {
  timestampMin: string;
  timestampMax: string;
}

interface BlockByNumberVars {
  number: string;
}

function queryBlockByDate(client: ApolloClient<any>, dateTime: DateTime): Promise<ApolloQueryResult<BlockData>> {
  return client.query<BlockData, BlockByDateVars>({
    query: BLOCK_BY_DATE,
    variables: {
      timestampMin: `${dateTime?.toSeconds().toFixed(0)}`,
      timestampMax: `${((dateTime?.toSeconds() || 0) + 1_000_000).toFixed(0)}`,
    },
  });
}

function queryBlockByNumber(client: ApolloClient<any>, block: string): Promise<ApolloQueryResult<BlockData>> {
  return client.query<BlockData, BlockByNumberVars>({
    query: BLOCK_BY_NUMBER,
    variables: {
      number: block
    },
  });
}

const timeTravelingNote = "You're currently viewing a past version of the board. The content is displayed as it was shown to users at the specified date.";

// Block traveled to when time traveling
// undefined when in present
let setTraveledBlock: (b: Block | undefined) => void;
export const useTraveledBlock = singletonHook<Block | undefined>(undefined, () => {
  let [block, setBlock] = useState<Block | undefined>();
  setTraveledBlock = setBlock;
  return block;
})

// Block traveled to when time traveling
// LastBlock when in present
let setCurrentBlock: (b: Block | undefined) => void;
const useCurrentBlock = singletonHook<Block | undefined>(undefined, () => {
  let [block, setBlock] = useState<Block | undefined>();
  setCurrentBlock = (b: Block | undefined) => {
    setBlock(b);
    setTraveledBlock(b);
  }
  return block;
})

export default forwardRef(({
  client,
  block,
  startBlock,
  dateTime,
  startRangeLabel,
  baseUrl,
  open,
  onOpen,
  onClose,
}: {
  client: ApolloClient<any>;
  block?: string;
  startBlock?: Block;
  dateTime?: DateTime;
  startRangeLabel: string;
  baseUrl: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}, ref: ForwardedRef<HTMLElement>) => { 
  if (block && isNaN(parseInt(block))) {
    block = undefined;
  }
  const now = DateTime.now();
  const history = useHistory();
  const { lastBlock } = useLastBlock();
  const [timeTravelRange, setTimeTravelRange] = useState<TimeTravelRange>();
  const currentBlock = useCurrentBlock();
  useTraveledBlock();
  const [prevQueriedBlock, setPrevQueriedBlock] = useState<string | undefined>(block);
  const [timeTraveledToDate, setTimeTraveledToDate] = useState<DateTime | undefined>(dateTime);
  const [timeTraveledToNumber, setTimeTraveledToNumber] = useState<string | undefined>(block);

  // this should be set to true only when prevQueriedBlock and the URL are
  // being written to, as the first of the two actions triggers
  // a parallel rerender of the component and causes a race condition
  // where the other action effectively doesn't happen, thus either breaking
  // time travel or causing each travel to perform two queries unnecessarily
  //
  // setting this value to true causes the component to allow prevQueriedBlock
  // to be out of sync with the url, as it knows it's in an incomplete state, so
  // the second render will effectively do nothing
  //
  // if you find a way to prevent this parallel rerender from occuring, feel
  // free to remove this god-awful hack
  const [writingState, setWritingState] = useState<boolean>(false);

  const changeBlock = useCallback(
    (block: Block) => {
      setCurrentBlock(block);
      //setTimeTraveledToNumber(`${block.number}`);
      setTimeTraveledToDate(DateTime.fromSeconds(parseInt(block.timestamp)));
    },
    [setTimeTraveledToDate]
  );

  const travelToLatest = useCallback(
    () => {
      if (lastBlock != null) {
        changeBlock(lastBlock);
        setTimeTraveledToNumber(lastBlock.number);
        setTraveledBlock(undefined);
      }
    },
    [lastBlock, changeBlock, setTimeTraveledToNumber]
  )

  const changeDate = useCallback(
    (date: DateTime) => {
      queryBlockByDate(client, date).then(result => {
        const b = result.data?.blocks?.[0];
        if (b != null) {
          const url = !!baseUrl
            ? baseUrl.includes("?")
              ? `${baseUrl}&block=${b.number}`
              : `${baseUrl}?block=${b.number}`
            : undefined;

          setWritingState(true);
          setPrevQueriedBlock(b.number);
          url && history.replace(url);
          setWritingState(false);
          setTimeTraveledToNumber(`${b.number}`);
          changeBlock(b);
        }
      });
    },
    [changeBlock, setTimeTraveledToNumber, history, baseUrl, setWritingState, client]
  );

  const changeNumber = useCallback(
    (block: string | null) => {
      const url = !!baseUrl
        ? !!block
          ? baseUrl.includes("?")
            ? `${baseUrl}&block=${block}`
            : `${baseUrl}?block=${block}`
          : `${baseUrl}`
        : undefined;

      setWritingState(true);
      setPrevQueriedBlock(block || undefined);
      url && history.replace(url);
      setWritingState(false);

      if (block) {
        queryBlockByNumber(client, block).then((result) => {
          const b = result.data?.blocks?.[0];
          changeBlock(b);
        });
      } else {
        travelToLatest();
      }
    },
    [changeBlock, baseUrl, history, travelToLatest, setPrevQueriedBlock, setWritingState, client]
  );

  useEffect(() => {
    if (block !== prevQueriedBlock && !writingState) {
      // out of sync with URL
      setPrevQueriedBlock(block);
      if (block) {
        setTimeTraveledToNumber(block);
        changeNumber(block);
      } else {
        travelToLatest();
      }
    } else if (!block && lastBlock && currentBlock !== lastBlock) {
      // not time traveling
      // move traveledBlock forward to keep in sync with latest
      travelToLatest();
    } else if (!currentBlock) {
      if (timeTraveledToDate != null) {
        changeDate(timeTraveledToDate);
      } else if (timeTraveledToNumber != null) {
        changeNumber(timeTraveledToNumber);
      } else {
        // not time travelling
        // need to initialize traveledBlock with latest
        travelToLatest();
      }
    }
  }, [
    block,
    currentBlock,
    changeDate,
    changeNumber,
    travelToLatest,
    timeTraveledToDate,
    timeTraveledToNumber,
    prevQueriedBlock,
    setPrevQueriedBlock,
    lastBlock,
    writingState
  ]);

  useEffect(() => {
    // the widget doesn't persist between pages but the useTraveledBlock
    // hook does, and if we don't clear it when we unload then the next
    // rendering of the widget will be in an invalid state, with the
    // state variables not matching with the actual block
    // unloading the block here will force the next render to reload its
    // state as if it were a fresh load of the page
    // there might be a better way to handle this, maybe by having the widget
    // depend on the singleton hook instead of the other way around so that
    // one can avoid having to reload the block that's already there, but
    // I haven't figured out the best way to do that yet
    return () => {
      setCurrentBlock(undefined);
    };
  }, []);

  useEffect(() => {
    if (startBlock && lastBlock) {
      setTimeTravelRange({
        min: startBlock,
        max: lastBlock,
      });
    }
  }, [startBlock, lastBlock, setTimeTravelRange]);

  const onDateChange = useCallback(
    (date: string) => {
      changeDate(DateTime.fromISO(date));
    },
    [changeDate]
  );

  const debouncedNumberChange = useMemo(
    () => _.debounce(changeNumber, 300),
    [changeNumber]
  );

  const onBlockNumberChange = useCallback(
    (block: string) => {
      setTimeTraveledToNumber(block);
      debouncedNumberChange(block);
    },
    [setTimeTraveledToNumber, debouncedNumberChange]
  );

  const onReturnToPresent = useCallback(
    () => {
      changeNumber(null);
    },
    [changeNumber]
  );

  const onInputBlockNumber = useCallback(
    () => {
      if (timeTravelRange == null) {
        return;
      }
      const input = prompt(
        `Block number: (range: ${timeTravelRange.min.number}-${timeTravelRange.max.number})`,
        timeTraveledToNumber
      );
      if (input === null) {
        return;
      }
      const newBlock = parseInt(input || "");
      if (
        isNaN(newBlock) ||
        newBlock < parseInt(timeTravelRange.min.number) ||
        newBlock > parseInt(timeTravelRange.max.number)
      ) {
        alert(`Invalid block number: ${input}`);
      } else {
        setTimeTraveledToNumber(input);
        changeNumber(input);
      }
    },
    [timeTravelRange, timeTraveledToNumber, setTimeTraveledToNumber, changeNumber]
  );

  const isTimeTraveling = !!(
    block &&
    lastBlock &&
    block !== lastBlock?.number
  );

  return (
    <details className="sm:relative" open={open} ref={ref}>
      <summary className="list-none cursor-pointer w-full mx-1 whitespace-nowrap" onClick={(event) => {
        event.preventDefault();
      }}>
        {timeTravelRange && baseUrl ? <>
          <div className="ml-2 hidden sm:block">
            {isTimeTraveling ? <>
              <span title={timeTravelingNote} onClick={() => {
                onReturnToPresent();
                onClose();
              }}>
                <div className="inline-block animation-spin spin-faster animation-direction-reverse">⌛</div> Time traveled to
              </span>
              {" "}
            </> : (
              null
            )}
            <span onClick={onOpen} className="text-xs">
              [
              <input
                required
                type="date"
                id="dchan-timetravel-date-input"
                value={(isTimeTraveling && timeTraveledToDate
                  ? timeTraveledToDate
                  : now
                ).toISODate()}
                onClick={(e) => {
                  if (!open) {
                    onOpen();
                  }
                  e.stopPropagation();
                }}
                onChange={(e) => onDateChange(e.target.value)}
                min={fromBigInt(timeTravelRange.min.timestamp).toISODate()}
                max={fromBigInt(timeTravelRange.max.timestamp).toISODate()}
              ></input>
              ,{" "}
              <span className="inline-block min-w-3rem">
                {(isTimeTraveling && timeTraveledToDate
                  ? timeTraveledToDate
                  : now
                ).toLocaleString(DateTime.TIME_SIMPLE)}
              </span>
              ]
            </span>
          </div>
          <div className="ml-2 sm:hidden" onClick={onOpen}>
            {isTimeTraveling ? (
              <abbr title={timeTravelingNote}>
                ⏱️
              </abbr>
            ) : (
              <span>⏱️</span>
            )}
          </div>
        </> : (
          null
        )}
      </summary>
      <div className="absolute w-screen sm:w-max top-7 sm:top-full sm:mt-1 left-0 right-0 sm:left-auto sm:right-0">
        {timeTravelRange ? (
          <div className="bg-primary border border-secondary-accent p-1">
            <div className="sm:hidden text-xs my-1 ml-2">
              <span className="mr-2">
                {isTimeTraveling ? (
                  <abbr
                    title="You're currently viewing a past version of the board. The content is displayed as it was shown to users at the specified date."
                  >
                    Time traveled to:
                  </abbr>
                ) : (
                  "Current time:"
                )}
              </span>
              <span onClick={onOpen}>
                [
                <input
                  required
                  type="date"
                  id="dchan-timetravel-date-input"
                  value={(isTimeTraveling && timeTraveledToDate
                    ? timeTraveledToDate
                    : now
                  ).toISODate()}
                  onChange={(e) => onDateChange(e.target.value)}
                  min={fromBigInt(timeTravelRange.min.timestamp).toISODate()}
                  max={fromBigInt(timeTravelRange.max.timestamp).toISODate()}
                ></input>
                ,{" "}
                <span className="inline-block min-w-3rem">
                  {(isTimeTraveling && timeTraveledToDate
                    ? timeTraveledToDate
                    : now
                  ).toLocaleString(DateTime.TIME_SIMPLE)}
                </span>
                ]
              </span>
            </div>
            <div className="grid align-center text-xs w-full">
              <button
                className="dchan-link"
                onClick={onInputBlockNumber}
              >
                {`Block #${timeTraveledToNumber || "?"}`}
              </button>

              {isTimeTraveling ? (
                <div className="text-xs text-center">
                  [
                  <button
                    className="dchan-link"
                    onClick={onReturnToPresent}
                  >
                    Return to present
                  </button>
                  ]
                </div>
              ) : (
                <div className="mb-4" />
              )}
            </div>
            <div className="text-xs bg-primary">
              <div className="grid grid-cols-4 center text-center">
                <span className="mx-1">{startRangeLabel}</span>
                <input
                  className="col-span-2"
                  id="timetravel"
                  type="range"
                  min={parseInt(timeTravelRange.min.number)}
                  max={parseInt(timeTravelRange.max.number)}
                  onChange={(e) => onBlockNumberChange(e.target.value)}
                  value={timeTraveledToNumber}
                />{" "}
                <span className="mx-1">Now</span>
              </div>
              <div className="grid grid-cols-4 center text-center">
                <span className="mx-1">
                  <div>
                    {fromBigInt(timeTravelRange.min.timestamp).toLocaleString(
                      DateTime.DATETIME_SHORT
                    )}
                  </div>
                  <div>#{timeTravelRange.min.number}</div>
                </span>
                <span className="col-span-2" />
                <span className="mx-1">
                  <div>
                    {fromBigInt(timeTravelRange.max.timestamp).toLocaleString(
                      DateTime.DATETIME_SHORT
                    )}
                  </div>
                  <div>#{timeTravelRange.max.number}</div>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-primary border border-secondary-accent p-1">
            Cannot time travel here.
          </div>
        )}
      </div>
    </details>
  );
});
