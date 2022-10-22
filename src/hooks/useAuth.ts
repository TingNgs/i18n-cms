import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useAppDispatch, useAppStore } from '../redux/store';

import firebase from '../utils/firebase';

import { setAuthState } from '../redux/appSlice';
import { getSessionStorage } from '../utils/storage';

const auth = getAuth(firebase);

const useAuth = () => {
  const dispatch = useAppDispatch();
  const { getState } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && getSessionStorage('github_access_token')) {
        dispatch(setAuthState({ authState: 'signIn', firebaseUid: user.uid }));
        return;
      }
      dispatch(setAuthState({ authState: 'signOff' }));
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch, getState]);
};

export default useAuth;
