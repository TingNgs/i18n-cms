import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { noop } from 'lodash-es';

const usePageTracking = () => {
  const history = useHistory();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return noop;
    ReactGA.send('pageview');
    const unlisten = history.listen(() => {
      ReactGA.send('pageview');
    });
    return unlisten;
  }, [history]);
};

export default usePageTracking;
