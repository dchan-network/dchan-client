import HeaderNavigation from "components/header/HeaderNavigation";
import HeaderLogo from "components/header/logo";
import { Board, Thread } from "dchan";
import { Link } from "react-router-dom";
import Status from "components/Status";
import IdLabel from "components/IdLabel";
import Menu from "components/Menu";
import { useState } from "react";
import { lockBoard, removeBoard, unlockBoard } from "dchan/operations";
import { useUser, useWeb3 } from "hooks";
import { DateTime } from "luxon";

export default function BoardHeader({
  block,
  dateTime,
  board,
  thread,
  baseUrl,
  search,
}: {
  block?: string;
  dateTime?: DateTime;
  board?: Board | null;
  thread?: Thread;
  baseUrl?: string;
  search?: string;
}) {
  const { accounts } = useWeb3()
  const { isJannyOf } = useUser()
  const isJanny = board ? isJannyOf(board.id) : false
  const [status, setStatus] = useState<string | object>();

  return (
    <header id="board-header">
      <HeaderNavigation
        block={block}
        dateTime={dateTime}
        board={board || undefined}
        thread={thread}
        baseUrl={baseUrl}
        search={search}
      />

      <HeaderLogo></HeaderLogo>

      <div className="text-4xl text-contrast font-weight-800 font-family-tahoma relative">
        <div className="text-xs pb-2">
          <IdLabel
            id={board?.id || "0x0000000000000000000000000000000000000000"}
          ></IdLabel>
        </div>
        <div>
          <span>
            {board?.isLocked ? (
              <span title="Board locked. You cannot reply anymore.">🔒</span>
            ) : (
              <span></span>
            )}
          </span>{" "}
          <span className="font-semibold">
            {board === null ? (
              <div>/?/ - ?????</div>
            ) : (
              <Link to={board ? `/${board.name}/${board.id}${search || ""}${block ? `?block=${block}` : ""}` : "#"}>
                /{board?.name || "?"}/ - {board?.title || "..."}
              </Link>
            )}
          </span>
          {board && isJanny ? (
            <span>
              <span>
                <Menu>
                  <div>
                    {board.isLocked ? (
                      <span>
                        <input name="lock" type="hidden" value="false"></input>
                        <button
                          onClick={() =>
                            unlockBoard(board?.id, accounts, setStatus)
                          }
                        >
                          🔓 Unlock
                        </button>
                      </span>
                    ) : (
                      <span>
                        <input name="lock" type="hidden" value="true"></input>
                        <button
                          onClick={() => lockBoard(board.id, accounts, setStatus)}
                        >
                          🔒 Lock
                        </button>
                      </span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => removeBoard(board.id, accounts, setStatus)}
                    >
                      ❌ Remove
                    </button>
                  </div>
                  {/* <div>
                    <button onClick={() => grantJanny(board.id, accounts, setStatus)}>
                      🧹 Add Janny
                    </button>
                  </div>
                  <div>
                    <button onClick={() => removeJanny(board.id, accounts, setStatus)}>
                      🧹 Remove Janny
                    </button>
                  </div> */}
                </Menu>
              </span>
              <Status
                className="p-4"
                status={status}
              ></Status>
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="p-2">
        <hr></hr>
      </div>
    </header>
  );
}
