import Spinner from "components/Spinner";
import { Link } from "react-router-dom";

const HeaderLogo = () => (
  <Link to="/">
    <span className="h-24 font-mono center grid grid-cols-2 relative">
      <span className="text-right mr-8">dchan</span>
      <span className="absolute left-0 right-0 bottom-0 top-0 m-auto h-16"><Spinner size={16}></Spinner></span>
      <span className="text-left ml-8">network</span>
    </span>
  </Link>
);

export default HeaderLogo;
