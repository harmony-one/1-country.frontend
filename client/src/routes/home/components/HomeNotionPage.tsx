import React, { useEffect, useState } from 'react'

import { ewsApi } from '../../../api/ews/ewsApi'
import { NotionRenderer } from 'react-notion-x'
import { Navigate } from 'react-router-dom'
import { Code } from 'react-notion-x/build/third-party/code'
import TweetEmbed from 'react-tweet-embed'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { Equation } from 'react-notion-x/build/third-party/equation'
import { Modal } from 'react-notion-x/build/third-party/modal'
import { Pdf } from 'react-notion-x/build/third-party/pdf'
import { type ExtendedRecordMap } from 'notion-types'
import { Helmet } from 'react-helmet'

import { useStores } from '../../../stores'
import {
  extractTitle,
  extractDescription,
  extractPageCover,
  extractPageEmoji,
  makeEmojiDataUrl,
  extractEmoji,
  isValidNotionPageId,
} from '../../../../contracts/ews-common/notion-utils'
import { getPath } from '../../../api/ews/utils'

import { LinkWrapper } from '../../../components/Controls'
import { FlexColumn, FlexRow, Main } from '../../../components/Layout'
import config from '../../../../config'
import { BaseText } from '../../../components/Text'
import NotionLogo from '../../../../assets/images/Notion-logo.svg'

// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import { NotionPageContainer } from '../Notion.styles'

interface LinkReplacerConfig {
  children: JSX.Element
  pageId: string
  allowedPageIds: string[]
}

export const Loading = ({ size = 16 }: { size?: number }): JSX.Element => {
  return <h1>Loading...</h1>
  // <TailSpin stroke='grey' width={size} height={size} />
}

export const LoadingScreen = ({
  children,
}: {
  children?: JSX.Element | JSX.Element[]
}): JSX.Element => {
  return (
    <Main style={{ justifyContent: 'center' }}>
      <FlexRow>
        <Loading size={64} />
      </FlexRow>
      {children}
    </Main>
  )
}

export const BlankPage = ({
  children,
}: {
  children?: JSX.Element | JSX.Element[]
}): JSX.Element => {
  return (
    <Main style={{ justifyContent: 'center' }}>
      <FlexRow>{children}</FlexRow>
    </Main>
  )
}

const Tweet = ({ id }: { id: string }): JSX.Element => {
  return <TweetEmbed tweetId={id} />
}

const HomeNotionPage: React.FC = () => {
  const [page, setPage] = useState<ExtendedRecordMap>()
  const [pageId, setPageId] = useState<string>('')
  const [allowedPageIds, setAllowedPageIds] = useState<string[]>([])

  const pageIdOverride = getPath().slice(1)
  const { rootStore, domainStore } = useStores()

  const sld = domainStore.domainName
  const subdomain = domainStore.subdomain

  useEffect(() => {
    if (!pageId) {
      return
    }
    if (
      pageIdOverride &&
      !allowedPageIds.includes(pageIdOverride) &&
      pageIdOverride !== pageId
    ) {
      return
    }
    const renderedPageId = pageIdOverride || pageId
    try {
      const getNotion = async () => {
        const records = await ewsApi.getNotionPage(renderedPageId)
        setPage(records)
      }
      getNotion()
    } catch (e) {
      console.log(e)
    }
  }, [pageId, pageIdOverride, allowedPageIds])

  useEffect(() => {
    // @ts-expect-error debugging
    window.client = rootStore.ewsClient
  }, [rootStore.ewsClient])

  useEffect(() => {
    if (!rootStore.ewsClient || !sld) {
      return
    }
    try {
      const getPages = async () => {
        return await Promise.all([
          rootStore.ewsClient.getLandingPage(sld, subdomain).then((e) => {
            setPageId(e)
          }),
          rootStore.ewsClient.getAllowedPages(sld, subdomain).then((e) => {
            setAllowedPageIds(e)
          }),
        ])
      }
      getPages()
    } catch (e) {
      console.log(e)
    }
  }, [rootStore.ewsClient, sld, subdomain])

  console.log('pageId + sld domain', pageId, sld, subdomain)
  // if (initializing) {
  //   return <LoadingScreen />
  // }

  if (!pageId) {
    return (
      <BlankPage>
        <FlexColumn style={{ textAlign: 'center' }}>
          <BaseText>
            This site has not connected with any notion page <br />
            <br />
            {/* If you are the owner, please visit{' '}
            <LinkWrapper href={'/manage'}>here</LinkWrapper> to configure the
            site */}
          </BaseText>
        </FlexColumn>
      </BlankPage>
    )
  }

  if (
    pageIdOverride &&
    !allowedPageIds.includes(pageIdOverride) &&
    pageIdOverride !== pageId
  ) {
    if (isValidNotionPageId(pageIdOverride)) {
      return <Navigate to={`https://notion.so/${pageIdOverride}`} />
    }
    return <Navigate to={'/manage'} />
  }

  // if (pending) {
  //   // return <LoadingScreen><BaseText>Loading Content...</BaseText></LoadingScreen>
  //   return <LoadingScreen />
  // }

  if (!page) {
    // return <LoadingScreen><BaseText>Rendering Page...</BaseText></LoadingScreen>
    return <LoadingScreen />
  }
  const blocks = Object.values(page.block)
  const title = extractTitle(blocks)
  const desc = extractDescription(page)
  const coverImageUrl = extractPageCover(blocks)
  const emoji =
    (extractPageEmoji(blocks) ?? extractEmoji(title)) || extractEmoji(desc)
  // console.log({ title, desc, coverImageUrl, emoji })
  // return <div>
  //   <Tweet id={'1324595039742222337'} />
  //   <Tweet id={'1466447129178783744'} />
  // </div>
  console.log('JAJJAAJ', coverImageUrl)
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {emoji && <link rel="icon" href={makeEmojiDataUrl(emoji)} />}
        <meta
          property="og:image"
          content={coverImageUrl ? coverImageUrl : NotionLogo}
        />
        <meta
          property="twitter:image"
          content={coverImageUrl ? coverImageUrl : NotionLogo}
        />
        <meta
          property="og:url"
          content={`https://${sld}.${config.tld}/${pageIdOverride}`}
        />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
      </Helmet>
      <NotionPageContainer>
        <h1>HOLA</h1>
        <NotionRenderer
          recordMap={page}
          fullPage={true}
          darkMode={false}
          rootPageId={pageId}
          components={{
            Code,
            Collection,
            Equation,
            Modal,
            Pdf,
            Tweet,
          }}
        />
      </NotionPageContainer>
    </>
  )
  // return <LinkReplacer pageId={pageId} allowedPageIds={allowedPageIds}>
  //   <NotionRenderer
  //     recordMap={page}
  //     fullPage={true}
  //     darkMode={false}
  //     components={{
  //       Code,
  //       Collection,
  //       Equation,
  //       Modal,
  //       Pdf,
  //       Tweet
  //     }}/>
  // </LinkReplacer>
}

export default HomeNotionPage
