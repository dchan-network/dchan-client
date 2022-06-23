import polygonSrc from "assets/images/polygon.png";
import thegraphSrc from "assets/images/thegraph.png";
import IPFSClientWidget from "./IPFSClientWidget";
import FAQButton from "./FAQCard";
import RulesButton from "./RulesCard";
import AbuseButton from "./AbuseCard";

export default function Footer({
  showContentDisclaimer = false,
  className = "mt-auto",
}: {
  showContentDisclaimer?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-primary ${className}`}>
      <div id="bottom" />
      <footer className="mt-4">
        {showContentDisclaimer ? (
          <div className="text-xs text-gray-400 hover:text-gray-600">
            All trademarks and copyrights on this page are owned by their
            respective parties. Posted content is responsibility of the poster.
          </div>
        ) : (
          ""
        )}
        <div className="grid items-start grid-cols-3 mt-1 border-t border-black text-xs relative w-100vw overflow-visible">
          <div className="text-left px-6">
            <div>Powered by</div>
            <div className="flex m-1">
              <a
                className="mx-1"
                href="//polygon.technology/"
                target="_blank"
                rel="noreferrer"
              >
                <img className="w-4 h-4" src={polygonSrc} alt="Polygon" />
              </a>
              <a
                className="mx-1"
                href="//thegraph.com/"
                target="_blank"
                rel="noreferrer"
              >
                <img className="w-4 h-4" src={thegraphSrc} alt="The Graph" />
              </a>
            </div>
          </div>
          <div className="justify-center flex flex-wrap h-6 items-end">
            <div className="mt-2">
              <RulesButton className="border border-black py-1 px-4 mx-1 bg-white"/>
            </div>
            <div className="mt-2">
              <AbuseButton className="border border-black py-1 px-4 mx-1 bg-white whitespace-nowrap"/>
            </div>
            <div className="mt-2">
              <FAQButton className="border border-black py-1 px-4 mx-1 bg-white"/>
            </div>
            <div className="mt-2">
              <a
                className="dchan-link border border-black py-1 px-4 mx-1 bg-white"
                href="//github.com/dchan-network"
                target="_blank"
                rel="noreferrer"
              >
                git
              </a>
            </div>
          </div>
          <div className="justify-end text-right px-6 text-xs text-gray-600 flex">
            <div>
              <div>v0.0.1</div>
              <div>
                <a
                  className="dchan-link"
                  href="//github.com/dchan-network/dchan-client/issues/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report a bug
                </a>
              </div>
              <div>
                <IPFSClientWidget />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
