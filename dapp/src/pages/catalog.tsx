import BoardHeader from "components/board/header";
import FormPost from "components/form/post";
import Footer from "components/Footer";
import CatalogThread from "components/catalog/CatalogThread";
import { useQuery } from "@apollo/react-hooks";
import CATALOG from "dchan/graphql/queries/catalog";
import { Board, Thread } from "dchan";
import useWeb3 from "hooks/useWeb3";
import UserData from "hooks/userData";
import Loading from "components/Loading";

interface CatalogData {
  board: Board;
  pinned: Thread[];
  threads: Thread[];
}
interface CatalogVars {
  boardId: string;
  limit: number
}

export default function CatalogPage({
  match: {
    params: { boardId },
  },
}: any) {
  const useWeb3Result = useWeb3();
  const { loading, data } = useQuery<CatalogData, CatalogVars>(CATALOG, {
    variables: { boardId: `0x${boardId}`, limit: 25 },
    pollInterval: 10000,
  });

  const { accounts } = useWeb3Result;
  const userData = UserData(accounts);
  console.log({userData})
  const isJanny = false // @TODO Check user is in any of board jannies or is admin

  const board = data?.board
  const threads = [...(data?.pinned || []), ...(data?.threads || [])];

  return (
    <div className="min-h-100vh" dchan-board={data?.board?.name}>
      <BoardHeader
        board={data?.board}
        isJanny={isJanny}
        accounts={accounts}
      ></BoardHeader>

      <FormPost board={data?.board} useWeb3={useWeb3Result}></FormPost>

      <div className="p-2">
        <hr></hr>
      </div>

      {loading ? (
        <Loading></Loading>
      ) : board && threads ? (
        threads.length === 0 ? (
          <div className="center grid">{`No threads.`}</div>
        ) : (
          <div>
            <div className="grid grid-template-columns-ram-150px place-items-start font-size-090rem px-4 md:px-8">
              {threads.map((thread: Thread) => (
                <CatalogThread board={board} thread={thread} key={thread.id}></CatalogThread>
              ))}
            </div>

            <div>
              <a
                href="#board-header"
                className="inline bg-secondary rounded-full"
              >
                ⤴️
              </a>
            </div>
          </div>
        )
      ) : (
        "Board not found"
      )}

      <Footer></Footer>
    </div>
  );
}
