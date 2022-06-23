import StillStuck from "components/StillStuck";
import { isMaticChainId } from "dchan";
import { switchChain } from "dchan/chain";
import { useWeb3 } from "hooks";
import { useCallback } from "react";
import { useState } from "react";
import polygonLogo from "assets/images/polygon.png";

export default function WalletSwitchChain() {
  const { provider, chainId } = useWeb3()
  const [switchingChain, setSwitchingChain] = useState<boolean>(false);

  const onSwitchChain = useCallback(async () => {
    setSwitchingChain(true)
    await switchChain();
    setSwitchingChain(false)
  }, [])

  return provider && !isMaticChainId(chainId) ? (
    <div className="p-4">
      <div>
        You need to be connected to the <img
            className="inline h-4 w-4 ml-1"
            alt="MATIC"
            src={polygonLogo} /> Polygon chain in order to interact with
        dchan.
      </div>
      <div>
        [
        <button
          className="dchan-link"
          onClick={onSwitchChain}
        >
          Switch chain
        </button>
        ]
      </div>
      <div className="text-xs">Polygon chain ID: 0x89</div>
      <div className="text-xs">Current chain ID: {chainId}</div>
      {switchingChain ? <StillStuck ms={3000}>
        <div className="text-xs px-2">
          If the button doesn't work, try switching the network from your wallet.
          <StillStuck ms={6000}><div>If you can't find the correct chain in your wallet, try manually adding it using {" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.google.com/search?q=how+to+add+polygon+chain"
              className="dchan-link"
            >
              this guide
            </a>.</div></StillStuck>
        </div>
      </StillStuck> : ""}
    </div>
  ) : (
    <span></span>
  );
}
