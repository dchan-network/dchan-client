import useSettings from "hooks/useSettings";

export default function FilterSettings() {
  const [settings, setSettings] = useSettings();

  return (
    <details>
      <summary>Filter settings</summary>
      <div className="bg-secondary p-2 max-w-sm center grid">
        <div className="text-contrast text-xs text-center">
          ⚠ By disabling/changing filters, it's possible you may view/download highly disturbing content, or content which may be illegal
          in your jurisdiction.
          <div>Do so at your own risk.</div>
        </div>
        <div className="py-2">
          <div>
            <input
              id="dchan-input-show-below-threshold"
              className="mx-1 text-xs whitespace-nowrap opacity-50 hover:opacity-100"
              type="checkbox"
              checked={settings?.content_filter?.show_below_threshold}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  content_filter: {
                    ...settings?.content_filter,
                    show_below_threshold: e.target.checked,
                  },
                });
              }}
            ></input>
            <label htmlFor="dchan-input-show-below-threshold">
              Show hidden content
            </label>
          </div>
          <div>
            <label htmlFor="dchan-input-score-threshold">
              Score hide threshold
            </label>
            <div>
              <input
                id="dchan-input-score-threshold"
                className="mx-1 text-xs whitespace-nowrap opacity-50 hover:opacity-100"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings?.content_filter?.score_threshold}
                onChange={(e) =>
                  // @TODO this is cancer
                  setSettings({
                    ...settings,
                    content_filter: {
                      ...settings?.content_filter,
                      score_threshold: e.target.value,
                    },
                  })
                }
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
                }[settings?.content_filter?.score_threshold || "1"]
              }
            </div>
          </div>
        </div>
        <div className="text-xs text-left">
          ℹ Content score is based on quantity of user reports. Experimental feature, may be abusable.
        </div>
      </div>
    </details>
  );
}
