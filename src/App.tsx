import { getAuth, signOut } from 'firebase/auth';
import Auth from './feature/Auth';
import firebase from './firebase';

import useAuth from './hooks/useAuth';
import { useAppSelector } from './redux/store';

const auth = getAuth(firebase);
function App() {
  useAuth();

  const onLogoutClick = () => {
    console.log('here we click');
    signOut(auth);
  };

  const authState = useAppSelector((state) => state.AppReducer.authState);

  if (authState === 'initial') return <div>Loading</div>;

  return (
    <div>
      {authState === 'signIn' ? (
        <button onClick={onLogoutClick}>logout</button>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
