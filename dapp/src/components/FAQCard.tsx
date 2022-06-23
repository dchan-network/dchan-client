import Card from "components/Card";
import { useState } from "react";
import { singletonHook } from "react-singleton-hook";
import Faucets from "./Faucets";
import OverlayComponent from "./OverlayComponent";

export function TheGraph() {
  return (
    <span>
      <a
        className="text-blue-600 visited:text-purple-600"
        href="//thegraph.com/"
        target="_blank"
        rel="noreferrer"
      >
        The Graph
      </a>{" "}
      <span className="text-xs">
        (ticker:{" "}
        <a
          className="text-blue-600 visited:text-purple-600"
          href="//www.coingecko.com/en/coins/the-graph"
          target="_blank"
          rel="noreferrer"
        >
          GRT
        </a>
        )
      </span>
    </span>
  );
}

export function Polygon() {
  return (
    <a
      className="text-blue-600 visited:text-purple-600"
      href="//polygon.network/"
      target="_blank"
      rel="noreferrer"
    >
      Polygon
    </a>
  );
}

export function FAQCard({onExit, className}: {onExit: () => void, className?: string}) {
  return (
    <Card title={<span>FAQ</span>} className={className} bodyClassName="flex overflow-y-auto overscroll-contain">
      <div className="text-left p-8 text-sm">
        <div className="pb-2">
          <strong>Q: What is this?</strong>
          <div>
            This is dchan.network, a decentralized time-traveling imageboard.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: ...Decentralized?</strong>
          <div>
            dchan.network is a Web3 imageboard whose posts and images are
            respectively stored on <Polygon />'s blockchain and on IPFS, using{" "}
            <TheGraph /> to index and serve the content in a decentralized
            manner.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: ...Time-Traveling?</strong>
          <div>
            dchan.network's backend was built using <TheGraph />, which is capable of obtaining data as it was at any point
            in time, allowing you to read
            dchan.network's boards and threads exactly as they were, whenever in the
            past. This also means that there is no need for an archive, as
            it is already built in the protocol.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: ...Imageboard?</strong>
          <div>
            dchan.network is a simple image-based bulletin board where anyone can
            post comments, share images and create boards. It is heavily
            inspired by 4chan.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: Are posts anonymous?</strong>
          <div>
            No. Or rather, they are as anonymous as the address they're posted from. 
            <br/>
            Due to the public nature of the blockchain, posts are directly tied to whoever signed the post, meaning that <b>your post history is public, tied to your wallet address' identity and to any past activity</b>.
            <br />
            Please be mindful of that when posting.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: Oh crap oh no I posted something I shouldn't have, how can I delete it?</strong>
          <div>
            Too bad.
            <br />
            Once you post on the blockchain, it's forever.
            <br />
            You cannot delete it.
            <br />
            You cannot change it.
            <br />
            <b>The blockchain never forgets.</b>
            <br />
            Please be mindful of that when posting.
          </div>
        </div>
        
        <div className="pb-2">
          <strong>Q: Is it free?</strong>
          <div>
            Kind of. You will need a crypto wallet to post and some <Polygon /> to pay the TX fee to post. A tiny bit of it should let you post a couple times, as <Polygon />'s gas fee should be cheap enough as long as the network works as intended.
            <br />
            You can get some free <Polygon /> at the following faucets:
            <div><Faucets /></div>
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: How do I post?</strong>
          <div>
            You'll need to install{" "}
            <a
              className="dchan-link"
              href="//metamask.io"
            >
              Metamask
            </a>{" "}
            (if you're on Desktop) or{" "}
            <a
              className="dchan-link"
              href="//trustwallet.com/"
            >
              Trust Wallet
            </a>{" "}
            (if you're on Mobile). Other wallets might not be supported. You'll need to connect your crypto wallet to post on dchan.network, but it's not required if you just want to lurk.
          </div>
        </div>

        <div className="pb-2">
          <strong>Q: Does dchan.network have a token? I need a useless shitcoin to lose all my life savings on.</strong>
          <div>
            dchan.network does not require any token to function except <Polygon /> for
            sending txs, so no. 
            <br/>
            This may change in the future.
          </div>
        </div>

        <div className="pb-2">
          <strong>
            Q: Is this open source?
          </strong>
          <div>
            Of course.
            <br/>
            <a
              className="text-blue-600 visited:text-purple-600"
              href="//github.com/dchan-network/"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-4 mb-12 text-center mx-auto cursor-pointer text-blue-600 visited:text-purple-600" onClick={onExit}>
          Close
        </div>
      </div>
    </Card>
  )
}

const FAQCardOverlayInternal = OverlayComponent(FAQCard);

export const useFAQ = singletonHook<[boolean, (open: boolean) => void]>([false, () => {}], () => {
  return useState<boolean>(false);
})

export function FAQCardOverlay() {
  const [openFAQ, setOpenFAQ] = useFAQ();
  return openFAQ
    ? <FAQCardOverlayInternal
      onExit={() => setOpenFAQ(false)}
      className="h-full flex flex-col flex-grow flex-shrink-0"
      overlayClassName="w-full sm:w-4/6 h-5/6"
    />
    : null;
}

export default function FAQButton({className = ""}: {className?: string}) {
  const [, setOpenFAQ] = useFAQ();
  return (
    <>
      <span
        className={`${className} cursor-pointer dchan-link`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpenFAQ(true);
        }}
      >
        FAQ
      </span>
    </>
  );
}