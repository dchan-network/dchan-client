import Footer from "components/Footer";
import GenericHeader from "components/header/generic";
import { Link } from "react-router-dom";
import { useWeb3, useUser } from "hooks";
import { sendMessage } from "dchan";
import WalletConnect from "components/wallet/WalletConnect";
import { useEffect } from "react";

export default function AdminPage() {
  const { isAdmin } = useUser();
  const { accounts } = useWeb3();

  useEffect(() => {
    window.scrollTo({top: 0})
  }, [])

  const adminClaim = async () => {
    await sendMessage("admin:claim", {}, accounts[0]);
  };

  const adminGrant = async () => {
    const hex_address = prompt("Whomst 0x?")
    alert(`Granting admin to ${hex_address}`)
    await sendMessage("admin:grant", {hex_address}, accounts[0]);
  };

  const clientPublish = async () => {
    const ipfs_hash = prompt("IPFS hash?")
    const version = prompt("Version?")
    const channel = prompt("Channel?") || ""
    const valid = !!ipfs_hash && !!version;
    alert(
      `${valid ? "Publishing" : "Invalid"} '${ipfs_hash}', version '${version}' on channel '${channel}'`
    );
    (await valid) && sendMessage("client:publish", { ipfs_hash, version, channel }, accounts[0]);
  };

  const chanLock = async () => {
    await sendMessage("chan:lock", {}, accounts[0]);
  };

  const chanUnlock = async () => {
    await sendMessage("chan:unlock", {}, accounts[0]);
  };

  return (
    <div className="bg-primary min-h-100vh">
      <GenericHeader title="Admin panel"></GenericHeader>

      <WalletConnect></WalletConnect>

      {isAdmin() ? (
        <div>
          <div className="center grid">
            <button onClick={clientPublish}>Publish Client</button>
          </div>

          <div className="center grid">
            <button onClick={adminClaim}>Claim Admin</button>
          </div>

          <div className="center grid">
            <button onClick={adminGrant}>Grant Admin</button>
          </div>

          <div className="center grid">
            <button onClick={chanLock}>Lock</button>
            <button onClick={chanUnlock}>Unlock</button>
          </div>

          <Link
            className="m-4 dchan-link"
            to="/"
          >
            Home
          </Link>

          <Footer />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
