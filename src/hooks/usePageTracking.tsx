import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { noop } from 'lodash-es';

const usePageTracking = ({
  isCookiesAccepted
}: {
  isCookiesAccepted: boolean;
}) => {
  const history = useHistory();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !isCookiesAccepted) return;
    ReactGA.initialize(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '');
  }, [isCookiesAccepted]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !isCookiesAccepted)
      return noop;
    ReactGA.send('pageview');
    const unlisten = history.listen(() => {
      ReactGA.send('pageview');
    });
    return unlisten;
  }, [history, isCookiesAccepted]);
};

export default usePageTracking;
