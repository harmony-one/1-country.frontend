import React from 'react'
import { Box } from 'grommet'
import { WidgetContainer } from './WidgetContainer'
import { WidgetHead } from './WidgetHead'
import { WidgetLikes } from './WidgetLikes'
import { WidgetItem, WidgetType } from '../../../stores/WidgetsStore'
import { TwitterTimelineEmbed } from 'react-twitter-embed'

interface Props {
  widget: WidgetItem<WidgetType.TWITTER>
}
export const WidgetTwitter: React.FC<Props> = ({ widget }) => {
  return (
    <WidgetContainer>
      <WidgetHead justify="flex-end">
        <WidgetLikes />
      </WidgetHead>

      <TwitterTimelineEmbed
        sourceType="profile"
        screenName={widget.get('accountName')}
        tweetLimit={1}
        autoHeight={true}
        placeholder={
          <Box fill align="center" justify="center">
            Loading...
          </Box>
        }
      />
    </WidgetContainer>
  )
}
