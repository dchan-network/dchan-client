import { useLocation } from "react-router";
import { HashLink } from "react-router-hash-link";

export default function Anchor({
  label,
  to
}: {
  label: string
  to: string
}) {
  const search = useLocation().search;
  
  return (
    <div>
      [
      <HashLink
        className="dchan-link"
        to={`${search}${to}`}
      >
        {label}
      </HashLink>
      ]
    </div>
  );
}
