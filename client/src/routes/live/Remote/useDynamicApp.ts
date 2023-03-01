import * as React from 'react';
import { useDynamicScript } from './useDynamicScript';

// TODO
// temporary fix for busting cache
const currentVersion = Date.now();

export interface RemoteSystem {
  url: string;
  scope: string;
  module: string;
}

export function useDynamicApp<T>({ url, scope, module }: RemoteSystem) {
  const [Component, setComponent] = React.useState<React.ComponentType<T>>(
    null,
  );
  const { status: scriptStatus } = useDynamicScript({
    url: `${url}?version=${currentVersion}`,
  });

  React.useEffect(() => {
    if (scriptStatus === 'ready') {
      const c = React.lazy(loadComponentFromRemoteContainer(scope, module));
      setComponent(c);
    }
  }, [scriptStatus]);

  const componentDefined = Boolean(Component);
  const readyToUse = scriptStatus === 'ready' && componentDefined;

  return [Component, { readyToUse, scriptStatus, componentDefined }] as const;
}

/**
 *
 * @param scope container name
 * @param module component name
 */
function loadComponentFromRemoteContainer(scope: string, module: string) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // @ts-ignore
    await __webpack_init_sharing__('default');

    const container = window[scope] as RemoteContainer;

    // Initialize the container, it may provide shared modules
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);

    const factory = await container.get(module);
    const Module = factory();

    return Module;
  };
}

interface RemoteContainer {
  get: Function;
  init: Function;
}