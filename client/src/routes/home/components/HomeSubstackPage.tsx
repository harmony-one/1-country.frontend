import React, { useEffect, useState } from 'react'

import { ewsApi } from '../../../api/ews/ewsApi'
import { NotionRenderer } from 'react-notion-x'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'react-notion-x/src/styles.css'
// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
import { LinkWrapper } from '../../../components/Controls'
import { FlexColumn, FlexRow, Main } from '../../../components/Layout'
import { Helmet } from 'react-helmet'
import { BaseText } from '../../../components/Text'

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

export interface PageProps {
  url: string
}

const HomeSubStackPage: React.FC = (props: PageProps) => {
  const [pageContent, setPageContent] = useState('')

  useEffect(() => {
    try {
      const loadData = async () => {
        const data = await ewsApi.getSubstackPage(props.url)
        console.log('Substack data loaded', data)
        setPageContent(data)
        // document.open();
        // document.write(pageContent);
        // document.close();
        // setPage(records)
      }
      loadData()
    } catch (e) {
      console.log('Cannot load data:', e)
    }
  }, [props.url])

  if (!props.url) {
    return (
      <BlankPage>
        <FlexColumn style={{ textAlign: 'center' }}>
          <BaseText>
            This site has not connected with any Substack page <br />
            <br />
            If you are the owner, please visit{' '}
            <LinkWrapper href={'/manage'}>here</LinkWrapper> to configure the
            site
          </BaseText>
        </FlexColumn>
      </BlankPage>
    )
  }

  if (!pageContent) {
    return <LoadingScreen />
  }
  return (
    <>
      <Helmet>
        <title>123</title>
      </Helmet>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </>
  )
}

export default HomeSubStackPage
