import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useAppDispatch, useAppStore } from '../redux/store';

import firebase from '../firebase';

import { setIsLogin } from '../redux/App/appSlice';
import { useGetGithubAccessTokenMutation } from '../redux/App/AuthApi';

const auth = getAuth(firebase);

const useAuth = () => {
  const [getGithubAccessToken] = useGetGithubAccessTokenMutation();
  const dispatch = useAppDispatch();
  const { getState } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { authState } = getState().AppReducer;
        if (authState === 'initial') {
          getGithubAccessToken({ userId: user.uid });
        }
      } else {
        dispatch(setIsLogin('signOff'));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch, getState, getGithubAccessToken]);
};

export default useAuth;
