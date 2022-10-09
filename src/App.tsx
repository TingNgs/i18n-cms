import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './component/AppLayout';
import About from './component/About';
import Dashboard from './component/Dashboard';
import Repo from './component/Repo';
import { useAppSelector } from './redux/store';
import { isAuthSelector } from './redux/selector';

function App() {
  const isAuth = useAppSelector(isAuthSelector);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<About />} />
          <Route
            path="/dashboard"
            element={isAuth ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/repo"
            element={isAuth ? <Repo /> : <Navigate to="/" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
