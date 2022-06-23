import Card from "components/Card";
import { useState } from "react";
import { singletonHook } from "react-singleton-hook";
import OverlayComponent from "./OverlayComponent";

export function RulesCard() {
  return (
    <Card title={<span>The rules</span>} className="flex flex-col flex-grow flex-shrink-0" bodyClassName="flex">
      <div className="p-8">
      <ul className="list-disc text-wrap text-left m-auto">
        <li>
        Do not post anything that can get you in trouble with local or
        global jurisdictions.
        </li>
        <li>Be decent.</li>
      </ul>
      </div>
    </Card>
  );
}

const RulesCardOverlayInternal = OverlayComponent(RulesCard);

export const useRules = singletonHook<[boolean, (open: boolean) => void]>([false, () => {}], () => {
  return useState<boolean>(false);
})

export function RulesCardOverlay() {
  const [openRules, setOpenRules] = useRules();
  return openRules
    ? <RulesCardOverlayInternal
      onExit={() => setOpenRules(false)}
    />
    : null;
}

export default function RulesButton({className = ""}: {className?: string}) {
  const [, setOpenRules] = useRules();
  return (
    <>
      <span
        className={`${className} cursor-pointer dchan-link`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpenRules(true);
        }}
      >
        Rules
      </span>
    </>
  );
}