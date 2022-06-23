import { getBalance, isMaticChainId } from "dchan";
import { useEffect, useState } from "react";
import UserLabel from "components/UserLabel";
import Faucets from "components/Faucets";
import polygonLogo from "assets/images/polygon.png";
import { useWeb3, useUser } from "hooks";

export default function WalletAccount() {
  const { provider, accounts, chainId } = useWeb3();
  const user = useUser().data?.user
  const account = accounts[0];
  const [balance, setBalance] = useState<number>();

  useEffect(() => {
    const refreshBalance = async () => {
      try {
        if (account) {
          setBalance(parseInt(await getBalance(account)) / Math.pow(10, 18));
        } else {
          setBalance(undefined);
        }
      } catch (e) {
        console.error({ refreshBalance: e });
      }
    };

    const interval = setInterval(refreshBalance, 10000);
    refreshBalance();

    return () => clearInterval(interval);
  }, [account]);

  return provider && account && user && isMaticChainId(chainId) ? (
    <div className="text-xs center grid">
      <div>
        <span className="px-1">Connected as</span>
        <span key={account}>
          [<UserLabel user={user}/>]
        </span>
      </div>
      <div>
        {balance !== undefined ? (
          <span>
            ( {balance.toFixed(4)}
            <img
              className="inline h-4 w-4 mx-1"
              alt="MATIC"
              src={polygonLogo} />
            )
            {balance !== undefined && balance < 0.001 ? (
              <div className="p-4">
                <div>Need Matic?</div>
                <div>
                  Free faucets:
                  <Faucets />
                </div>
              </div>
            ) : (
              ""
            )}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  ) : (
    <span></span>
  );
}
