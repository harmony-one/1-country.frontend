import React from 'react'
import { observer } from 'mobx-react-lite'
import { Helmet } from 'react-helmet'
import { metaTagsStore } from './MetaTagsStore'

interface Props {}

export const MetaTags: React.FC<Props> = observer(() => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{metaTagsStore.tags.title}</title>
      <meta
        name="description"
        content="Harmony's .country domains allow a seamless transition between Web2 and Web3. You can use your .country domain for both traditional websites and decentralized applications, making it easier to access everything you need from one place!"
      />
    </Helmet>
  )
})
