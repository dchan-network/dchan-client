import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/react-hooks";
import { useEffect, useMemo } from "react";
import { SingletonHooksContainer } from "react-singleton-hook";

import "assets/styles/index.scss";

import AdminPage from "pages/admin";
import BoardListPage from "pages/boards";
import BoardPage from "pages/board";
import HomePage from "pages/home";
import LockBanner from "components/LockBanner";
import PostSearchPage from "pages/postSearch";
import ReferencePage from "pages/reference";
import ThreadPage from "pages/thread";
import EULA from "components/EULA";
import IdReferencePage from "pages/idReference";
import { FAQCardOverlay } from "components/FAQCard";
import { RulesCardOverlay } from "components/RulesCard";
import { AbuseCardOverlay } from "components/AbuseCard";
import DefaultSettings from "settings/default";

import { useState } from "react";
import { useSettings } from "hooks";
import { Settings, writeAppSetSettings } from "hooks/useSettings";

// So there's an issue with how settings works
//
// It's loaded via a singletonHook, which is just a wrapper
// around a hook for reading/writing to local storage
//
// In order to allow singleton hooks access to the client
// (e.g. so useLastBlock can access it), we need to put
// <SingletonHooksContainer/> inside <ApolloProvider/> in
// the App component
//
// The issue is that because settings can now force App
// to reload the apollo client, it now depends on Settings,
// which is loaded by a singleton hook, but App also
// loads <SingletonHooksContainer/>, which causes an
// infinite loop to occur and crashes the page
//
// To fix this, we need to break that loop by having the
// settings in the App component be separate from the one
// in the hook, and to do this we load the settings beforehand
// directly, then have the hook overwrite App's settings value
// whenever changes are made
//
// It's an awful hack, but it works
function useLocalSettings() {
  return useState<Settings>(() => {
    try {
      const item = window.localStorage.getItem("dchan.config");
      return item ? {...DefaultSettings, ...JSON.parse(item)} : DefaultSettings;
    } catch (error) {
      console.error({error});
      return DefaultSettings;
    }
  });
}

// @HACK keeps localstorage endpoints in sync with
// DefaultSettings, remove when users are allowed
// to change it themselves
let endpointsWritten: boolean = false;
function WriteEndpointsHack() {
  let [settings, setSettings] = useSettings();
  useEffect(() => {
    if (!endpointsWritten && settings) {
      endpointsWritten = true;
      let newSettings = {...settings};
      newSettings.subgraph.endpoint = DefaultSettings.subgraph.endpoint;
      newSettings.ipfs.endpoint = DefaultSettings.ipfs.endpoint;
      setSettings(newSettings);
    }
  }, [setSettings, settings])
  return null;
}

function App() {
  const [settings, setSettings] = useLocalSettings();
  writeAppSetSettings(setSettings);

  const client = useMemo(
    () => new ApolloClient({
      uri: DefaultSettings.subgraph.endpoint,
      cache: new InMemoryCache(),
    }),
    []
  );

  return settings?.eula?.agreed === false ? (
    <EULA />
  ) : (
    <ApolloProvider client={client}>
      <SingletonHooksContainer/>
      <WriteEndpointsHack/>
      <Router basename="/">
        <LockBanner />
        <div className="App text-center">
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/_/boards" component={BoardListPage} />
            <Route path="/_/admin" component={AdminPage} />
            <Route path="/_/posts" component={PostSearchPage} />
            <Route path="/0x:id/:post_n" component={ReferencePage} />
            <Route path="/0x:id" component={IdReferencePage} />
            <Route
              path="/:board_name/0x:board_id/:view_mode(index|catalog)"
              component={BoardPage}
            />
            <Route
              path="/:board_name/0x:board_id/0x:user_id/:thread_n/0x:focus_user_id/:focus_post_n"
              component={ThreadPage}
            />
            <Route
              path="/:board_name/0x:board_id/0x:user_id/:thread_n/0x:focus_user_id"
              component={ThreadPage}
            />
            <Route
              path="/:board_name/0x:board_id/0x:user_id/:thread_n/:focus_post_n"
              component={ThreadPage}
            />
            <Route
              path="/:board_name/0x:board_id/0x:user_id/:thread_n/:post_n"
              component={ThreadPage}
            />
            <Route
              path="/:board_name/0x:board_id/0x:user_id/:thread_n"
              component={ThreadPage}
            />
            <Route path="/:board_name/0x:board_id" component={BoardPage} />
            <Route exact path="/:board_name" component={BoardListPage} />
          </Switch>
          <FAQCardOverlay/>
          <RulesCardOverlay/>
          <AbuseCardOverlay/>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
