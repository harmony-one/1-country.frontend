import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {observer} from "mobx-react-lite";
import {SocialMediaElement} from "./SocialMediaElement";
import {useStores} from "../../stores";
import {FaTelegram} from "react-icons/fa";
import {OWNER_INFO_FIELDS} from "../../api";
import {AiFillYoutube} from "react-icons/ai";
import {useWeb3Modal} from "@web3modal/react";
import {useOutletContext} from "react-router";
import {OutletContext} from "../../routes/navigation/OutletContext";


const Container = styled.div`
  padding-top: 0.4em;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1em;
`

export const SocialMedia: React.FC = observer(() => {
  const { isClientConnected } = useOutletContext<OutletContext>()

  const { domainRecordStore } = useStores()

  useEffect(() => {
    domainRecordStore.loadOwnerInfo();
  }, [domainRecordStore.domainRecord]);

  const redirectToTelegram = (name: string) => {
    window.open(`https://t.me/${name}`, '_black')
  }

  const { open } = useWeb3Modal()

  const handleTelegramClick = async () => {
    if (!isClientConnected) {
      await open({ route: 'ConnectWallet' })
      return;
    }

    let telegramName = domainRecordStore.profile.telegram

    if (!telegramName) {
      telegramName = await domainRecordStore.revealOwnerInfo(OWNER_INFO_FIELDS.TELEGRAM);
    }

    if (telegramName) {
      return redirectToTelegram(telegramName)
    }
  }

  return (
    <Container>
      {domainRecordStore.profile.youtube &&
      <SocialMediaElement icon={<AiFillYoutube size='25px' />} url={domainRecordStore.profile.youtube} />
      }
      {domainRecordStore.profile.telegram &&
        <SocialMediaElement icon={<FaTelegram size='25px' />} onClick={handleTelegramClick} />
      }
    </Container>
  )

})