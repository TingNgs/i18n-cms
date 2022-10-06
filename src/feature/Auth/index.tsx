import { useCallback } from 'react';
import { useLoginMutation } from '../../redux/App/AuthApi';

const Auth = () => {
  const [login, { isLoading }] = useLoginMutation();

  const onLoginClicked = useCallback(() => {
    login(undefined);
  }, [login]);

  return (
    <div>
      {isLoading ? (
        'loading'
      ) : (
        <button onClick={onLoginClicked}>Login button</button>
      )}
    </div>
  );
};

export default Auth;
