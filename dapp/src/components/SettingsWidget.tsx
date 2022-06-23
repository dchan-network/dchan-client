import { useSettings } from "hooks";
import { useMemo, useState } from "react";
import { debounce } from "lodash";
import { Settings } from "hooks/useSettings";
// import DefaultSettings from "settings/default";

export default function SettingsWidget({onExit}: {onExit: () => void}) {
  const [settings, setSettings] = useSettings();

  /*
  const [displaySubgraph, setDisplaySubgraph] = useState<
    string | undefined
  >(settings?.subgraph?.endpoint);
  const writeSubgraphEndpoint = useCallback(
    (settings: Settings, val: string) => {
      let updatedSettings = {...settings};
      settings.subgraph.endpoint = val;
      setSettings(updatedSettings);
    },
    [setSettings]
  );
  const writeSubgraphEndpointDebounced = useMemo(
    () => debounce(writeSubgraphEndpoint, 500),
    [writeSubgraphEndpoint]
  );

  const [displayIPFS, setDisplayIPFS] = useState<
    string | undefined
  >(settings?.ipfs?.endpoint);
  const writeIPFSEndpoint = useCallback(
    (settings: Settings, val: string) => {
      let updatedSettings = {...settings};
      settings.ipfs.endpoint = val;
      setSettings(updatedSettings);
    },
    [setSettings]
  );
  const writeIPFSEndpointDebounced = useMemo(
    () => debounce(writeIPFSEndpoint, 500),
    [writeIPFSEndpoint]
  );
  */

  const [displayScoreThreshold, setDisplayScoreThreshold] = useState<
    number | undefined
  >(settings?.content_filter?.score_threshold);
  const writeScoreThresholdDebounced = useMemo(
    () => debounce((settings: Settings, val: number) => {
      let updatedSettings = {...settings};
      settings.content_filter.score_threshold = val;
      setSettings(updatedSettings);
    }, 500),
    [setSettings]
  );

  return (settings ? (
    <div className="bg-secondary border-secondary-accent border-2 flex flex-col h-full">
      <div className="mb-2 mt-1 px-3" style={{flex: "0 1 auto"}}>
        <div className="float-left">
          <span className="font-bold">dchan Settings</span>
        </div>
        <div className="float-right">
          <button onClick={onExit}>
            ❌
          </button>
        </div>
      </div>
      <div className="h-full overflow-y-scroll overscroll-contain" style={{flex: "1 1 auto"}}>
        {/*
        <fieldset className="border border-secondary-accent rounded px-4 pb-2 mx-2">
          <legend className="font-bold">Subgraph Endpoint</legend>
          <div>Endpoint used to query the subgraph for data.</div>
          <div>If you're having issues with boards/threads not loading, check if resetting to default fixes the issue first.</div>
          <button
            className="border border-black px-1 mb-0.5 bg-primary"
            onClick={() => {
              setDisplaySubgraph(DefaultSettings.subgraph.endpoint);
              writeSubgraphEndpoint(settings, DefaultSettings.subgraph.endpoint);
            }}
          >
            Reset to default
          </button>
          <textarea
            className="w-full"
            spellCheck={false}
            onChange={(e) => {
              setDisplaySubgraph(e.target.value);
              writeSubgraphEndpointDebounced(settings, e.target.value);
            }}
            value={displaySubgraph}
          />
        </fieldset>
        <fieldset className="border border-secondary-accent rounded px-4 pb-2 mx-2">
          <legend className="font-bold">IPFS Endpoint</legend>
          <div>Endpoint used to upload images to IPFS.</div>
          <div>If you're having issues with image uploads failing, check if resetting to default fixes the issue first.</div>
          <button
            className="border border-black px-1 mb-0.5 bg-primary"
            onClick={() => {
              setDisplayIPFS(DefaultSettings.ipfs.endpoint);
              writeIPFSEndpoint(settings, DefaultSettings.ipfs.endpoint);
            }}
          >
            Reset to default
          </button>
          <textarea
            className="w-full"
            spellCheck={false}
            onChange={(e) => {
              setDisplayIPFS(e.target.value);
              writeIPFSEndpointDebounced(settings, e.target.value);
            }}
            value={displayIPFS}
          />
        </fieldset>
        */}
        <fieldset className="border border-secondary-accent rounded px-4 pb-2 mx-2">
          <legend className="font-bold">Filter Settings</legend>
          <div className="text-contrast">
            ⚠ By disabling/changing filters, it's possible you may view/download highly disturbing content, or content which may be illegal
            in your jurisdiction.
            <div>Do so at your own risk.</div>
          </div>
          <input
            id="dchan-input-show-below-threshold"
            className="mx-1 text-xs whitespace-nowrap opacity-80 hover:opacity-100"
            type="checkbox"
            checked={settings.content_filter.show_below_threshold}
            onChange={(e) => {
              let updatedSettings = {...settings};
              settings.content_filter.show_below_threshold = e.target.checked;
              setSettings(updatedSettings);
            }}
          />
          <label htmlFor="dchan-input-show-below-threshold">
            Show hidden content
          </label>
          <br/>
          <label htmlFor="dchan-input-score-threshold">
            Score hide threshold
          </label>
          <div>
            <input
              id="dchan-input-score-threshold"
              className="mx-1 text-xs whitespace-nowrap opacity-80 hover:opacity-100"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={displayScoreThreshold}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setDisplayScoreThreshold(val);
                writeScoreThresholdDebounced(settings, val);
              }}
            />
          </div>
          <div className="text-sm">
            {
              {
                "0": "Show everything",
                "0.1": "Hide heavily reported content",
                "0.2": "Hide heavily reported content",
                "0.3": "Hide heavily reported content",
                "0.4": "Hide reported content",
                "0.5": "Hide reported content",
                "0.6": "Hide reported content",
                "0.7": "Hide slighly reported content",
                "0.8": "Hide slighly reported content",
                "0.9": "Hide slighly reported content",
                "1": "Only show content with no reports",
              }[displayScoreThreshold ?? "1"]
            }
          </div>
        </fieldset>
      </div>
    </div>
  ) : (
    null
  ));
}