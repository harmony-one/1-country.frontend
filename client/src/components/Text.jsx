import styled from 'styled-components'

export const BaseText = styled.div`
  color: ${props => props.$color || 'inherit'};
  font-size: 0.9rem;
`
export const SmallText = styled(BaseText)`
  font-size: 0.8rem;
`
export const Label = styled(BaseText)`
  width: ${props => props.$width || '64px'};
`
export const LabelSmall = styled(BaseText)`
  width: ${props => props.$width || '48px'};
  font-size: 1rem;
`

export const Address = styled(BaseText)`
  word-break: break-word;
  padding: 8px 32px;
  user-select: all;
`

export const Title = styled.div`
  font-family: 'NunitoBold', system-ui;
  font-size: 1.5rem;
  margin: 16px auto;
  text-align: center;
  text-transform: uppercase;
`

export const Heading = styled.div`
  text-transform: uppercase;
  box-sizing: border-box;
  padding: 16px;
  background: black;
  color: white;
  //height: 56px;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export const Desc = styled.div`
  box-sizing: border-box;
  padding: 16px;
  color: ${props => props.$color || '#758796'};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
`

export const DescLeft = styled(Desc)`
  text-align: left;
  align-items: start;
`

export const LinkText = styled(BaseText)`
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
  margin-top: 32px;
`

export const Hint = styled.div`
  font-size: 10px;
  color: ${props => props.$color ?? '#758796'};
`

export const SmallTextGrey = styled(SmallText)`
  color: #758796;
`

export const OnwerLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`