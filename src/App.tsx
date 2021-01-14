import React, { ReactElement, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import 'hds-core';
import {
  AuthContext,
  AuthTokens,
  getTokens,
  parseAuthParams,
  removeTokens,
  storeTokens,
} from './auth/auth-context';
import Main from './components/main/Main';
import NavigationAndFooterWrapper from './components/navigation-and-footer-wrapper/NavigationAndFooterWrapper';
import { ToastProvider } from './components/notification/toastContext';
import './App.scss';
import PrivateResourceRoute from './resource/PrivateResourceRoute';
import ResourcePage from './resource/page/ResourcePage';
import CreateNewOpeningPeriodPage from './opening-period/page/CreateNewOpeningPeriodPage';
import EditOpeningPeriodPage from './opening-period/page/EditOpeningPeriodPage';

type OptionalAuthTokens = AuthTokens | undefined;

const getPersistentTokens = (): OptionalAuthTokens => {
  const authTokensFromQuery: OptionalAuthTokens = parseAuthParams(
    window.location.search
  );

  if (authTokensFromQuery) {
    storeTokens(authTokensFromQuery);
  }

  return getTokens();
};

export default function App(): JSX.Element {
  const [authTokens, setAuthTokens] = useState<AuthTokens | undefined>(
    getPersistentTokens()
  );

  const clearAuth = (): void => {
    setAuthTokens(undefined);
    removeTokens();
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authTokens, clearAuth }}>
        <ToastProvider>
          <Router>
            <NavigationAndFooterWrapper>
              <Main id="main">
                <Switch>
                  <Route exact path="/">
                    <h1>Etusivu</h1>
                  </Route>
                  <Route exact path="/not_found">
                    <h1>Kohdetta ei löydy</h1>
                    <p>
                      Kohdetta ei löytynyt. Yritä myöhemmin uudestaan. Ongelman
                      toistuessa ota yhteys sivuston ylläpitoon. Teidät on
                      automaattisesti kirjattu ulos.
                    </p>
                  </Route>
                  <Route exact path="/unauthorized">
                    <h1>Puutteelliset tunnukset</h1>
                  </Route>
                  <Route exact path="/unauthenticated">
                    <h1>Puuttuvat tunnukset</h1>
                  </Route>
                  <PrivateResourceRoute
                    id="resource-route"
                    exact
                    path="/resource/:id"
                    render={({
                      match,
                    }: RouteComponentProps<{ id: string }>): ReactElement => (
                      <ResourcePage id={match.params.id} />
                    )}
                  />
                  <PrivateResourceRoute
                    id="create-new-opening-period-route"
                    exact
                    path="/resource/:id/period/new"
                    render={({
                      match,
                    }: RouteComponentProps<{
                      id: string;
                    }>): ReactElement => (
                      <CreateNewOpeningPeriodPage
                        resourceId={match.params.id}
                      />
                    )}
                  />
                  <PrivateResourceRoute
                    id="edit-opening-period-route"
                    path="/resource/:id/period/:datePeriodId"
                    render={({
                      match,
                    }: RouteComponentProps<{
                      id: string;
                      datePeriodId: string;
                    }>): ReactElement => (
                      <EditOpeningPeriodPage
                        resourceId={match.params.id}
                        datePeriodId={match.params.datePeriodId}
                      />
                    )}
                  />
                </Switch>
              </Main>
            </NavigationAndFooterWrapper>
          </Router>
        </ToastProvider>
      </AuthContext.Provider>
    </div>
  );
}
