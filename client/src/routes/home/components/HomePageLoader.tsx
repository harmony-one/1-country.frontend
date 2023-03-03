import React from 'react'
import { FlexColumn } from '../../../components/Layout'
import { Container } from '../Home.styles'
import { GradientText } from '../../../components/Text'

interface Props {}

export const HomePageLoader: React.FC<Props> = () => {
  return (
    <div className="preload">
      <div className="preload-text">.country</div>
      <div className="preload-loader" />
    </div>
  )
}
