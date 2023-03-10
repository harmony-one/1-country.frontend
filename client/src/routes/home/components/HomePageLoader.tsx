import React from 'react'

interface Props {}

export const HomePageLoader: React.FC<Props> = () => {
  return (
    <div className="preload">
      <div className="preload-text">.country</div>
      <div className="preload-loader" />
    </div>
  )
}
