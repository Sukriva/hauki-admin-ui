import React from 'react';
import { useHistory } from 'react-router-dom';
import { Navigation } from 'hds-react';
import api from '../../common/utils/api/api';
import { AuthContextProps, TokenKeys, useAuth } from '../../auth/auth-context';
import { useToast } from '../notification/toastContext';
import './HaukiNavigation.scss';

export default function HaukiNavigation(): JSX.Element {
  const authProps: Partial<AuthContextProps> = useAuth();
  const { authTokens, clearAuth } = authProps;
  const history = useHistory();
  const isAuthenticated = !!authTokens;
  const { showToast } = useToast();

  const showSignOutErrorNotification = (text: string): void => {
    showToast({
      key: 'invalid-sign-out',
      type: 'error',
      label: 'Uloskirjautuminen epäonnistui',
      text,
    });
  };

  const signOut = async (): Promise<void> => {
    try {
      const isAuthInvalidated = await api.invalidateAuth();
      if (isAuthInvalidated) {
        if (clearAuth) {
          clearAuth();
        }
        history.push('/');
      } else {
        showSignOutErrorNotification('Uloskirjautuminen hylättiin.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Sign out failed:', e.message);
      showSignOutErrorNotification(
        `Uloskirjautuminen epäonnistui. Yritä myöhemmin uudestaan. Virhe: ${e}`
      );
    }
  };

  return (
    <Navigation
      theme={{
        '--header-background-color': 'var(--hauki-header-background-color)',
        '--header-color': 'var(--hauki-header-color)',
      }}
      className="navigation-header"
      title="Aukiolot"
      menuToggleAriaLabel="Menu"
      skipTo="#main"
      skipToContentLabel="Siirry pääsisältöön">
      <Navigation.Actions>
        <Navigation.User
          authenticated={isAuthenticated}
          label="Kirjaudu"
          userName={authTokens && authTokens[TokenKeys.usernameKey]}>
          <Navigation.Item
            label="Kirjaudu ulos"
            target="_blank"
            variant="primary"
            onClick={(): Promise<void> => signOut()}
          />
        </Navigation.User>
      </Navigation.Actions>
    </Navigation>
  );
}
