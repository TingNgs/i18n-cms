import { memo, useCallback, useEffect, useRef } from 'react';
import { FILE_TYPE_MAP_DATA } from '../../constants';
import { RepoConfig } from '../../redux/editingRepoSlice';
import { useAppSelector } from '../../redux/store';

interface PostMessage {
  set_get_custom_path: string;
  get_custom_path: {
    namespace: string;
    language: string;
    repoConfig: RepoConfig;
  };
  get_custom_path_response: string;
}

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello Page</title>
    <script>
      window.FILE_TYPE_MAP_DATA = ${JSON.stringify(FILE_TYPE_MAP_DATA)};

      const handleGetCustomPath = (data) => {
        const result = window.getCustomPath(data);
        window.parent.postMessage({ type: 'get_custom_path_response', data: result, source: 'sandbox-iframe' }, '*');
      }

      let getCustomPathQueue = [];

      const setGetCustomPath = async (data) => {
        window.getCustomPath = undefined;
        const module = await import(\`data:text/javascript,\${data}\`);
        window.getCustomPath = module.default;
        getCustomPathQueue.forEach((data) => {
          handleGetCustomPath(data);
        })
        getCustomPathQueue = [];
      }
      
      onmessage = (e) => {
        const { type, data } = e.data;
        switch(type) {
          case 'set_get_custom_path':
            setGetCustomPath(data);
            break;
          case 'get_custom_path':
            if(!!window.getCustomPath) {
              handleGetCustomPath(data);
            } else {
              getCustomPathQueue.push(data);
            }
            break;
        }
      }
    </script>
  </head>
  <body>
      <p>Hello this is string html</p>
  </body>
</html>
`;

const SandboxIframe = () => {
  const customPathHandlerScript = useAppSelector(
    (state) => state.EditingRepoReducer.customPathHandlerScript
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const getCustomPathQueueRef = useRef<((path: string) => void)[]>([]);

  const postMessageToSandbox = useCallback(
    <key extends keyof PostMessage>(type: key, data: PostMessage[key]) => {
      iframeRef.current?.contentWindow?.postMessage({ type, data }, '*');
    },
    []
  );

  useEffect(() => {
    if (!customPathHandlerScript) return;

    if (iframeRef.current) {
      if (iframeRef.current.contentDocument?.readyState === 'complete') {
        postMessageToSandbox('set_get_custom_path', customPathHandlerScript);
      } else {
        iframeRef.current.addEventListener('load', () => {
          postMessageToSandbox('set_get_custom_path', customPathHandlerScript);
        });
      }
    }

    getCustomPathQueueRef.current = [];

    window.getCustomPath = async (data) => {
      return new Promise((resolve) => {
        getCustomPathQueueRef.current.push(resolve);
        postMessageToSandbox('get_custom_path', data);
      });
    };
    const handler = (e: MessageEvent) => {
      const { type, data, source } = e.data;
      if (source !== 'sandbox-iframe') return;
      if (type === 'get_custom_path_response' && typeof data === 'string') {
        getCustomPathQueueRef.current.shift()?.(data);
      }
    };
    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
      window.getCustomPath = undefined;
    };
  }, [customPathHandlerScript, postMessageToSandbox]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      srcDoc={html}
      width="0"
      height="0"
    />
  );
};

export default memo(SandboxIframe);
