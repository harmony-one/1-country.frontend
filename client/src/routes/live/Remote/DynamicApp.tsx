import * as React from 'react';
import { useDynamicApp, RemoteSystem } from './useDynamicApp';

const Error = () => {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre>Failed to load live module</pre>
        </div>
    )
}

export function DynamicApp(props: RemoteSystem) {
    const [App, { readyToUse, scriptStatus }] = useDynamicApp<RemoteSystem>(props);

    if (scriptStatus === 'failed') {
        return <Error />;
    }

    return readyToUse ? (<App {...props} />) : null;
}
