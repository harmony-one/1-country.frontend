import axios from 'axios';
import React, { useEffect, useState } from 'react'
import unescape from 'lodash.unescape';
import { mainApi } from '../../api/mainApi';

interface Props {
    id: string;
}

const IframeWidget: React.FC<Props> = ({ id }) => {
    const [html, setHtml] = useState(null);

    useEffect(() => {
        mainApi.getHtmlWidget(id).then(res => setHtml(unescape(res.data?.html)))
    }, [id]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />
}

export default IframeWidget;