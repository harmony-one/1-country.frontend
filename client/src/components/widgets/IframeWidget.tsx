import React, { useEffect, useRef, useState } from 'react'
import { mainApi } from '../../api/mainApi';

interface Props {
    id: string;
}

const IFRAME_WIDTH = '550px';

const IframeWidget: React.FC<Props> = ({ id }) => {
    const containerElement = useRef<HTMLDivElement>();

    const [attributes, setAttributes] = useState(null);

    useEffect(() => {
        mainApi.getHtmlWidget(id).then(res => setAttributes({
            ...res.data?.attributes,
            width: IFRAME_WIDTH
        }))
    }, [id]);

    useEffect(() => {
        if (attributes && containerElement) {
            const iframeElement = document.createElement('iframe');

            for (let key in attributes) {
                iframeElement.setAttribute(key, attributes[key]);
            }

            containerElement.current.innerHTML = '';

            containerElement.current.appendChild(iframeElement);
        }
    }, [attributes, containerElement]);

    return <div ref={containerElement} style={{ width: IFRAME_WIDTH }} />
}

export default IframeWidget;