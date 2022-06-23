import Card from "components/Card";
import { useState } from "react";
import { singletonHook } from "react-singleton-hook";
import OverlayComponent from "./OverlayComponent";

export function AbuseCard() {
  return (
  <Card
    title={<div className="">Abuse (DMCA/CSAM)</div>}
  >
  <div className="text-left p-4">
    This is a decentralized application: the content shown here is not hosted on this website's servers, but is instead retrieved via <a className="dchan-link" href="https://ipfs.io/" rel="nofollow">IPFS</a>.
    <br />
    Please refer to the IPFS Gateway Service's <a className="dchan-link" href="https://ipfs.io/legal/" rel="nofollow">legal page</a> to report any offending content.
  </div></Card>
  );
}

const AbuseCardOverlayInternal = OverlayComponent(AbuseCard);

export const useAbuse = singletonHook<[boolean, (open: boolean) => void]>([false, () => {}], () => {
  return useState<boolean>(false);
})

export function AbuseCardOverlay() {
  const [openAbuse, setOpenAbuse] = useAbuse();
  return openAbuse
    ? <AbuseCardOverlayInternal
      onExit={() => setOpenAbuse(false)}
    />
    : null;
}

export default function AbuseButton({className = ""}: {className?: string}) {
  const [, setOpenAbuse] = useAbuse();
  return (
    <>
      <span
        className={`${className} cursor-pointer dchan-link`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpenAbuse(true);
        }}
      >
        Abuse (DMCA/CSAM)
      </span>
    </>
  );
}