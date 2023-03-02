import * as React from 'react';

type Status = 'ready' | 'failed' | 'loading';

export function useDynamicScript(args: { url: string }) {
  const [scriptStatus, setStatus] = React.useState<Status>('loading');

  React.useEffect(() => {
    if (!args.url) {
      throw new Error('[Dynamic App]: URL should be provided');
    }

    const element = document.createElement('script');

    element.src = args.url;
    element.type = 'text/javascript';
    element.async = true;

    setStatus('loading');

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${args.url}`);
      setStatus('ready');
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setStatus('failed');
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    status: scriptStatus,
  };
}
