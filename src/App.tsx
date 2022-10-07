import AppLayout from './component/AppLayout';
import About from './component/About';
import Dashboard from './component/Dashboard';
import { useAppSelector } from './redux/store';
import { isAuthSelector } from './redux/App/appSelector';

function App() {
  const isAuth = useAppSelector(isAuthSelector);
  return <AppLayout>{isAuth ? <Dashboard /> : <About />}</AppLayout>;
}

export default App;
