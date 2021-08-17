import { useState } from "react";
import spoilerSrc from "assets/images/spoiler.png";
import nsfwSrc from "assets/images/nsfw.png";
import ipfsLoadingSrc from "assets/images/ipfs.png";
import ipfsErrorSrc from "assets/images/ipfs_error.png";

export default function IPFSImage({
  hash,
  style,
  htmlLoading = "lazy",
  className = "",
  isSpoiler = false,
  isNsfw = false,
  expandable = false,
  thumbnail = false,
}: {
  hash: string;
  className?: string;
  style?: React.CSSProperties;
  htmlLoading?: "eager" | "lazy";
  isSpoiler?: boolean;
  isNsfw?: boolean;
  expandable?: boolean;
  thumbnail?: boolean;
}) {
  const ipfsSrc = `https://ipfs.io/ipfs/${hash}`;
  const [imgError, setImgError] = useState<any>(false);
  const [imgLoading, setImgLoading] = useState<boolean>(true);
  const [imgSrc, setImgSrc] = useState<string>(ipfsSrc);
  const [showSpoiler, setShowSpoiler] = useState<boolean>(false);
  const [showNsfw, setShowNsfw] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(!thumbnail);

  const thumbnailClass = "max-w-32 max-h-32";
  const coverClass = "absolute bottom-0";
  const canShow = (!isNsfw || showNsfw) && (!isSpoiler || showSpoiler);

  const retry = () => {
    if (!!imgError) {
      setImgLoading(true);
      setImgSrc(ipfsSrc + "?t=" + new Date("2012.08.10").getTime());
      setImgError(undefined);
    }
  };

  !!imgError && console.log({ imgError });

  return (
    <span className={`${className} relative`}>
      <span
        className={
          "filter " + (!imgLoading && !imgError && !canShow ? "blur brightness-50 contrast-50" : "")
        }
        onClick={() => {
          if (isNsfw && !showNsfw) {
            setShowNsfw(true);
          } else if (isSpoiler && !showSpoiler) {
            setShowSpoiler(true);
          } else if (expandable) {
            setExpand(!expand);
          }
        }}
      >
        <div>
          <div className="opacity-50">
            {imgLoading ? (
              <div className="relative center grid">
                <img
                  className={"h-150px w-150px animation-download"}
                  style={style}
                  src={ipfsLoadingSrc}
                  alt=""
                />
                <div className="p-2">Loading...</div>
              </div>
            ) : imgError ? (
              <div className="relative center grid">
                <img
                  className={"h-150px w-150px animation-fade-in"}
                  style={style}
                  src={ipfsErrorSrc}
                  alt=""
                />
                <div className="p-2">Image load error</div>
              </div>
            ) : (
              ""
            )}
          </div>
          <img
            className={`${className} ${
              !expand || imgError ? thumbnailClass : ""
            } animation-fade-in`}
            style={
              imgLoading
                ? { ...style, visibility: "hidden" }
                : !!imgError
                ? { display: "none" }
                : style
            }
            src={imgSrc}
            onLoad={() => setImgLoading(false)}
            loading={htmlLoading}
            onClick={retry}
            onError={(e) => {
              setImgLoading(false);
              setImgError(e);
            }}
            alt=""
          />
        </div>
      </span>
      {!imgLoading && !showSpoiler && isSpoiler ? (
        <img
          className={[coverClass, thumbnailClass].join(" ")}
          src={spoilerSrc}
          alt="SPOILER"
          onClick={() => setShowSpoiler(true)}
        ></img>
      ) : (
        ""
      )}
      {!imgLoading && !showNsfw && isNsfw ? (
        <img
          className={[coverClass, thumbnailClass].join(" ")}
          src={nsfwSrc}
          alt="NSFW"
          onClick={() => setShowNsfw(true)}
        ></img>
      ) : (
        ""
      )}
    </span>
  );
}