import { useQuery } from "@apollo/react-hooks";
import Error from "components/Error";
import Loading from "components/Loading";
import { Post, Thread } from "dchan";
import SEARCH_BY_REF from "graphql/queries/search_by_ref";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Router } from "router";

interface RefSearchData {
  threads: Thread[];
  posts: Post[];
}
interface RefSearchVars {
  id: string;
  post_n: string;
}

export default function ReferencePage({ match: { params } }: any) {
  const [error, setError] = useState<string>();

  const history = useHistory();

  const id = `0x${params.id}`;
  const post_n = params.post_n;

  const { loading, data } = useQuery<RefSearchData, RefSearchVars>(
    SEARCH_BY_REF,
    {
      variables: { id, post_n },
    }
  );

  useEffect(() => {
    if (data) {
      let location = null;
      let thread = null;
      let post = null;

      let { threads, posts } = data;

      if (threads && threads.length > 0) {
        thread = threads[0];
      } else if (posts && posts.length > 0) {
        post = posts[0];
      }

      if (thread) {
        location = `${Router.thread(thread)}`;
      } else if (post) {
        location = `${Router.post(post)}`;
      }

      if ((thread || post) && !location) {
        setError(
          "Content not found. It may have been deleted, or the ID is invalid."
        );
      }

      if (location) {
        console.log({ location });
        history.replace(location);
      }
    }
  }, [history, data]);

  return (
    <div className="bg-primary center grid w-screen h-screen">
      {error ? (
        <Error subject={"Not found"}>
          <span>{error}</span>
        </Error>
      ) : (
        <div>
          {loading ? (
            <Loading />
          ) : (
            <Error subject="Content not found">
              <span>It may have been deleted, or the ID is invalid.</span>
            </Error>
          )}
          <div className="text-xs">
            {id}/{post_n}
          </div>
        </div>
      )}
    </div>
  );
}
