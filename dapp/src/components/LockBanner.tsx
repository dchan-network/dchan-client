import { useQuery } from "@apollo/react-hooks";
import CHAN_STATUS from "graphql/queries/chan_status";
import poopieSrc from "assets/images/poopie.png";
import Card from "./Card";
import { useSettings } from "hooks";
interface ChanStatusData {
  chanStatus: {
    isLocked: boolean;
  };
}

interface ChanStatusVars {
  id: string;
}

export default function LockBanner() {
  const [settings] = useSettings();
  const { data } = useQuery<ChanStatusData, ChanStatusVars>(CHAN_STATUS, {
    variables: {
      id: settings?.contract?.address || "",
    },
    skip: !settings?.contract?.address,
  });

  return data?.chanStatus?.isLocked ? (
    <div className="bg-primary relative" style={{ height: "100000vh" }}>
      <div className="center grid">
        <Card title={<div className="text-red-500 text-4xl">UH OH</div>} className="pt-4">
          <div className="center grid">
            <img src={poopieSrc} alt="poopie" />
            <div className="p-4">
              <div className="text-md">
                Someone made a stinky and dchan got locked.
              </div>
              <div className="text-sm">Hopefully it wasn't you.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  ) : (
    <span></span>
  );
}
