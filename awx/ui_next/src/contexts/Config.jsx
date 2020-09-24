import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { useHistory } from 'react-router-dom';
import { t } from '@lingui/macro';
import { axiosInstance, ConfigAPI, MeAPI, RootAPI } from '../api';
import AlertModal from '../components/AlertModal';
import ErrorDetail from '../components/ErrorDetail';
import IdleSessionAlert from './IdleSessionAlert';

// eslint-disable-next-line import/prefer-default-export
export const ConfigContext = React.createContext({});

export const ConfigProvider = ConfigContext.Provider;
export const Config = ConfigContext.Consumer;
export const useConfig = () => useContext(ConfigContext);

export function SessionContext({ i18n, children }) {
  const history = useHistory();
  const [config, setConfig] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [sessionExpiration, setSessionExpiration] = useState(null);
  const [configError, setConfigError] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const timeout = useRef(null);

  const handleLogout = useCallback(async () => {
    try {
      await RootAPI.logout();
      history.replace('/login');
    } catch (err) {
      setConfigError(err);
      history.replace('/login');
    }
  }, [history]);

  useEffect(() => {
    const resetIdleTimer = response => {
      const secondsRemaining = response.headers['session-timeout'];
      if (!secondsRemaining) return response;
      const now = new Date();
      setSessionExpiration(new Date(now.getTime() + secondsRemaining * 1000));
      setIsIdle(false);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setIsIdle(true);
      }, (secondsRemaining - 60) * 1000);
      return response;
    };

    const interceptor = axiosInstance.interceptors.response.use(resetIdleTimer);

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      if (config?.version) return;
      try {
        const [
          { data },
          {
            data: {
              results: [me],
            },
          },
        ] = await Promise.all([ConfigAPI.read(), MeAPI.read()]);
        setConfig({ ...data, me });
        setIsReady(true);
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
          return;
        }
        setConfigError(err);
      }
    };
    loadConfig();
  }, [config, handleLogout]);

  const refreshSession = () => {
    MeAPI.read();
  };

  return (
    <ConfigProvider value={{ config, configError, handleLogout }}>
      {isReady && children}
      {sessionExpiration && (
        <IdleSessionAlert
          isOpen={isIdle}
          sessionExpiration={sessionExpiration}
          onLogout={handleLogout}
          onContinue={refreshSession}
        />
      )}
      <AlertModal
        isOpen={configError}
        variant="error"
        title={i18n._(t`Error!`)}
        onClose={() => setConfigError(null)}
      >
        {i18n._(t`Failed to retrieve configuration.`)}
        <ErrorDetail error={configError} />
      </AlertModal>
    </ConfigProvider>
  );
}
