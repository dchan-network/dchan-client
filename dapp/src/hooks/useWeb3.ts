import { Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { singletonHook } from "react-singleton-hook";
import Web3Modal from "web3modal";

const NETWORK_NAME = "matic";

export type UseWeb3 = {
  provider: Web3Provider | undefined;
  chainId: string | number | undefined;
  accounts: string[];
  loadWeb3Modal: () => Promise<void>;
  logoutOfWeb3Modal: () => Promise<void>;
}

const useWeb3 = singletonHook({
  provider: undefined,
  chainId: undefined,
  accounts: [],
  loadWeb3Modal: async () => { },
  logoutOfWeb3Modal: async () => { }
} as any, () => {
  const [provider, setProvider] = useState<Web3Provider>();
  const [chainId, setChainId] = useState<string | number>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [autoloaded, setAutoloaded] = useState(false);
  const autoload = true;

  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const web3Modal = useMemo(() => {
    return new Web3Modal({
      network: NETWORK_NAME,
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider
        },
      },
    });
  }, []);

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    try {
      const newProvider = await web3Modal.connect();

      setProvider(new Web3Provider(newProvider));
      setChainId(window.ethereum.chainId)

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })
      setAccounts(accounts)

      window.ethereum.on('accountsChanged', (accounts: []) => {
        if (accounts.length === 0) {
          setProvider(undefined)
        }

        setAccounts(accounts)
      });
      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(chainId)
      });
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      window.location.reload();
    },
    [web3Modal],
  );

  // If autoload is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoload && !autoloaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoloaded(true);
    }
  }, [autoload, autoloaded, loadWeb3Modal, setAutoloaded, web3Modal.cachedProvider]);

  return {
    provider, chainId, accounts, loadWeb3Modal, logoutOfWeb3Modal
  }
});

export default useWeb3
