import React from "react";
import {observer} from "mobx-react-lite";
import {ModalContent} from "./ModalContent";
import styled from "styled-components";
import {Box} from "grommet";
import {BaseText, Title} from "../Text";
import {
  AiOutlinePicture,
  AiOutlineShoppingCart,
  AiOutlineTwitter,
  AiOutlineVideoCamera,
  IoTextSharp
} from "react-icons/all";
import {ModalHeader} from "./ModalHeader";
import {useStores} from "../../stores";
import {ModalIds} from "../../modules/modals";


interface CardProps {
  onClick?: () => void;
  children: React.ReactNode | React.ReactNode[]
}

const Card: React.FC<CardProps> = ({children, onClick}) => {
  return <Box onClick={onClick} pad="16px" round="8px" elevation="medium" align="center" justify="center" gap="8px">
    {children}
  </Box>
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  grid-gap: 16px;
`

interface Props {
  onClose?: () => void;
}

export const ModalWidgetAdd: React.FC<Props> = observer(({onClose}) => {

  const {modalStore} = useStores();

  const handleClick = () => {
    modalStore.showModal(ModalIds.PROFILE_ADD_WIDGET_TEXT);
  }

  return (
    <>
      <ModalHeader onClick={onClose} />
      <ModalContent>
        <Title>Add widget</Title>
        <Grid>
          <Card>
            <AiOutlineTwitter size="40px" />
            <BaseText>Twitter</BaseText>
          </Card>
          <Card onClick={handleClick}>
            <IoTextSharp  size="40px"/>
            <BaseText>Text</BaseText>
          </Card>
          <Card>
            <AiOutlineVideoCamera size="40px" />
            <BaseText>Video</BaseText>
          </Card>
          <Card>
            <AiOutlineShoppingCart  size="40px" />
            <BaseText>Merchandise</BaseText>
          </Card>
          <Card>
            <AiOutlinePicture  size="40px" />
            <BaseText>NFT</BaseText>
          </Card>
        </Grid>
      </ModalContent>
    </>
  )
})
