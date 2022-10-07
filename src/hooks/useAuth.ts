import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useAppDispatch, useAppStore } from '../redux/store';

import firebase from '../firebase';

import { setAuthState } from '../redux/App/appSlice';
import { useGetGithubAccessTokenMutation } from '../redux/services/authApi';

const auth = getAuth(firebase);

const useAuth = () => {
  const [getGithubAccessToken] = useGetGithubAccessTokenMutation();
  const dispatch = useAppDispatch();
  const { getState } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          throw new Error();
        }
        const { authState } = getState().AppReducer;
        if (authState === 'initial') {
          await getGithubAccessToken({
            userId: user.uid
          }).unwrap();
        }
      } catch {
        dispatch(setAuthState('signOff'));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch, getState, getGithubAccessToken]);
};

export default useAuth;
