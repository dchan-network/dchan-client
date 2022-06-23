import StillStuck from "components/StillStuck";
import { useWeb3 } from "hooks";
import { useCallback, useState } from "react";

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [hasError, setHasError] = useState<any | false>(false)
  const { provider, loadWeb3Modal, logoutOfWeb3Modal } = useWeb3();

  const onClick = useCallback(async () => {
    try {
      if (!provider) {
        setIsConnecting(true)
        const {success} = await loadWeb3Modal();
        setHasError(!success)
        setIsConnecting(false)
      } else {
        logoutOfWeb3Modal();
      }
    } catch(onClickError) {
      console.error({onClickError})
    }
  }, [provider, loadWeb3Modal, logoutOfWeb3Modal, setIsConnecting, setHasError])

  return (
    <div>
      <div>
        [
        <button
          className="dchan-link"
          onClick={onClick}
        >
          {isConnecting ? "Connecting wallet..." : !provider ? "Connect Wallet" : "Disconnect Wallet"}
        </button>
        ]
      </div>
      <span className="text-sm">
      {hasError ? <span>⚠️ Something went wrong. <br/>Check that your wallet is unlocked and doesn't have any pending modals, then try again.</span> : ""}
      {!hasError && isConnecting ? <StillStuck ms={2000}><span>If the above button does not work, try unlocking your wallet first, then retry.</span></StillStuck> : ""}
      </span>
      {!provider ? (
        <div className="text-xs px-2">
          <small className="p-1 text-center">
            <div>You need to connect your wallet to interact with dchan.</div>
            <div>
              Works with{" "}
              <a
                className="dchan-link"
                href="//metamask.io"
              >
                Metamask
              </a>{" "}
              (for Desktop) or{" "}
              <a
                className="dchan-link"
                href="//trustwallet.com/"
              >
                Trust Wallet
              </a>{" "}
              (for Mobile).
            </div>
            <div>Other wallets might not be supported.</div>
          </small>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
