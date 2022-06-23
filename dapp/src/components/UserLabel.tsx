import { User } from "dchan";
import IdLabel from "./IdLabel";

export default function UserLabel({ user, className = ""}: { className?: string, user: User }) {
  return (
    <a
      className="dchan-link"
      // eslint-disable-next-line
      href={`https://polygonscan.com/address/${user.address}`}
      target={`_blank`}
    >
      <IdLabel id={user.address || "0x000000"} className={className}>
        {user.b58id}
      </IdLabel>
    </a>
  );
}