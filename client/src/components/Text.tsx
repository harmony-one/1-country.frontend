import styled from 'styled-components'

export const BaseText = styled.div<{ $color?: string }>`
  color: ${(props) => props.$color || 'inherit'};
  font-size: 0.9rem;
`

export const GradientText = styled.div<{ $size?: string }>`
  font-size: ${(props) => props.$size || '24px'};
  font-family: NunitoBold, system-ui;
  font-weight: bold;
  background: linear-gradient(0.75turn, #69fabd, #00aee9);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(1px 1px 2px #0000000f);
`

export const SmallText = styled(BaseText)`
  font-size: 0.8rem;
`
export const Label = styled(BaseText)<{ $width: string }>`
  width: ${(props) => props.$width || '64px'};
`
export const LabelSmall = styled(BaseText)<{ $width: string }>`
  width: ${(props) => props.$width || '48px'};
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

export const Desc = styled.div<{ $color?: string }>`
  box-sizing: border-box;
  padding: 16px;
  color: ${(props) => props.$color || '#758796'};
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

export const Hint = styled.div<{ $color: string }>`
  font-size: 10px;
  color: ${(props) => props.$color ?? '#758796'};
`

export const SmallTextGrey = styled(SmallText)`
  color: #758796;
`

export const OnwerLabel = styled(SmallTextGrey)`
  margin-right: 16px;
`
