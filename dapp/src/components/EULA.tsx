import { useSettings } from "hooks";
import { useCallback, useState } from "react";
import Card from "./Card";
import logo from "assets/images/dchan.png";

export default function EULA() {
  const [settings, setSettings] = useSettings();
  const [agreed, setAgreed] = useState<boolean>(false);

  const onAgreeChange = useCallback((e: any) => {
    setAgreed(e.target.checked)
  }, [setAgreed])

  const onProceed = useCallback(() => {
    setSettings({
      ...settings,
      eula: {
        ...settings?.eula,
        agreed,
      },
    });
  }, [agreed, settings, setSettings]);

  return (
    <div className="center-grid w-full min-h-screen bg-primary">
      <div className="flex flex-wrap center">
        <Card
          title={
            <span>
              <a className="color-black" href="/">
                dchan.network
              </a>{" "}
              EULA
            </span>
          }
        >
          <div>
      <div className="center grid">
        <img className="p-2 w-16 pointer-events-none" src={logo} alt="dchan" />
      </div>
            <div className="p-1 text-left">
              <div className="p-2">
                To use dchan.network, you understand and agree to the following:
              </div>

              <div className="p-2">
                * The content of this website is for mature audiences only and may
                not be suitable for minors. If you are a minor or it is illegal
                for you to access mature images and language, do not proceed.
              </div>

              <div className="p-2">
                * Content is presented to you AS IS, with no warranty, express or
                implied.
              </div>

              <div className="p-2">
                By clicking "I Agree," you agree to accept full responsibility
                for any damages from your use of the website, and you understand
                that the content posted is not owned or generated by dchan.network, but
                rather by dchan.network's users.
              </div>

              <div className="text-center">
                <div className="p-2">
                  <input
                    id="dchan-input-agree"
                    className="mx-1 text-xs whitespace-nowrap opacity-50 hover:opacity-100"
                    type="checkbox"
                    checked={agreed}
                    onChange={onAgreeChange}
                  ></input>
                  <label htmlFor="dchan-input-agree">
                    I agree
                  </label>
                </div>

                <div className="p-2">
                  [
                  <button
                    className="dchan-link"
                    disabled={!agreed}
                    onClick={onProceed}
                  >
                    Proceed
                  </button>
                  ]
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
