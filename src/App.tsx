import { Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import LoadingModal from './component/LoadingModal';
import AppLayout from './component/AppLayout';

import About from './page/About';
import Dashboard from './page/Dashboard';
import Repo from './page/Repo';

import { useAppSelector } from './redux/store';
import { isAuthSelector } from './redux/selector';
import usePageTracking from './hooks/usePageTracking';

function App() {
  const isAuth = useAppSelector(isAuthSelector);
  usePageTracking();

  return (
    <Suspense fallback={<LoadingModal />}>
      <AppLayout>
        <Switch>
          <Route path="/" exact render={() => <About />} />
          <Route
            path="/dashboard"
            render={() => (isAuth ? <Dashboard /> : <Redirect to="/" />)}
          />
          <Route
            path="/repo"
            render={() => (isAuth ? <Repo /> : <Redirect to="/" />)}
          />
          <Route path="*" render={() => <Redirect to="/" />} />
        </Switch>
      </AppLayout>
    </Suspense>
  );
}

export default App;
