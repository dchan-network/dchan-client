import { useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { debounce } from "lodash";

export default function SearchWidget({
  baseUrl,
  search,
}: {
  baseUrl: string;
  search?: string;
}) {
  const history = useHistory();
  const [displayInput, setDisplayInput] = useState<string>(search || "");
  const setSearch = useCallback(
    (search: string) => {
      const newUrl = search
        ? baseUrl.includes("?")
          ? `${baseUrl}&s=${search}`
          : `${baseUrl}?s=${search}`
        : baseUrl;
      history.push(newUrl);
    },
    [history, baseUrl]
  );

  const setSearchDebounce = useMemo(
    () => debounce(setSearch, 500),
    [setSearch]
  );

  const onInput = useCallback(
    (search: string) => {
      setDisplayInput(search);
      setSearchDebounce(search);
    },
    [setSearchDebounce]
  );

  return (
    <div className="text-center bg-primary border border-secondary-accent p-1">
      <div>Search:</div>
      <div>
        <input
          id="dchan-search"
          className="text-center w-32"
          type="text"
          placeholder="..."
          value={displayInput}
          onChange={(e) => onInput(e.target.value)}
          autoFocus={true}
        ></input>
      </div>
      <div className="relative">
        {search ? (
          <span className="text-xs">
            [
            <button
              className="dchan-link"
              onClick={() => setSearch("")}
            >
              Cancel
            </button>
            ]
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
