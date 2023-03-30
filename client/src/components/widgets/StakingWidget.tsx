import React from 'react'
import { Widget } from 'harmony-staking-widget';

interface Props {
    validator: string;
}

const StakingWidget: React.FC<Props> = ({ validator }) => {
    return <div style={{
        borderRadius: 12,
        border: '1px solid rgb(207,217,222)',
        padding: 10
    }
    }>
        <Widget validator={validator} />
    </div >
}

export default StakingWidget;