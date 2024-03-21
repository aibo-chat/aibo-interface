import { observer } from 'mobx-react-lite'
import React from 'react'
import { keyframes, Box, Modal, styled, useMediaQuery, useTheme, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useMobxStore } from '../../../stores/StoreProvider'
import imageMap from '../../../images/imageMap'

const moveUp = keyframes`
0% {
  transform: translateY(0);
}

50% {
  transform: translateY(10px);
}

100% {
  transform: translateY(0);
}
`

const moveDown = keyframes`
0% {
  transform: translateY(0);
}

50% {
  transform: translateY(-10px);
}

100% {
  transform: translateY(0);
}
`
const moveIn = keyframes`
  0% {
    margin-top: 10px;
  }

  100% {
    margin-top: 0;
  }
`

const moveOn = keyframes`
0% {
  transform: translateY(120px);
  opacity: 0;
}

100% {
  transform: translateY(0px);
  opacity: 1;
}
`
const shake = keyframes`
  10%, 90% {
    transform: translate3d(-1px, -1px, 0);
  }

  20%, 80% {
    transform: translate3d(+2px, +2px, 0);
  }

  30%, 70% {
    transform: translate3d(-4px, -4px, 0);
  }

  40%, 60% {
    transform: translate3d(+4px, +4px, 0);
  }

  50% {
  transform: translate3d(-4px, -4px, 0) scale(1.05);
  }`
const active = {
  animationName: `${moveOn}, ${moveIn}`,
  animationDuration: '1500ms, 2s',
  animationTimingFunction: 'linear, linear',
  animationDelay: '0, 2s',
  animationIterationCount: '1, infinite',
  animationFillMode: 'forwards, forwards',
  animationDirection: 'normal, alternate',
}
const Image = styled('img')({
  animation: `${shake} 1s ease-in-out`,
  animationIterationCount: 'infinite',
  outline: 'none',
})
const baseCss = {
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '125.5px',
  height: '37px',
  borderRadius: '18px',
  fontWeight: 600,
  fontSize: '24px',
  padding: `0 5px`,
  backdropFilter: 'blur(2px)',
}
const HeadBox = styled(Box)(active)

const ShakeImgUp = styled('img')({
  animation: `${moveUp} 3s ease-in-out`,
  animationIterationCount: 'infinite',
})

const ShakeImgDown = styled('img')({
  animation: `${moveDown} 3s ease-in-out`,
  animationIterationCount: 'infinite',
})
const CryptoBoxModal: React.FC<any> = () => {
  const {
    modalStore: { cryptoBoxModalVisible, setCryptoBoxModalVisible, giftAmount },
  } = useMobxStore()
  const { t } = useTranslation()
  const handleClose = () => setCryptoBoxModalVisible(false)

  const { breakpoints } = useTheme()
  const isMobile = useMediaQuery(breakpoints.down('lg'))

  return (
    <Modal
      open={cryptoBoxModalVisible}
      onClose={handleClose}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 0,
        '.MuiPaper-root': {
          outline: 'none',
          borderRadius: '16px',
        },
        '.MuiBackdrop-root': {
          background: 'rgba(0, 0, 0, 0.7)',
        },
      }}
      onClick={(e) => {
        e.stopPropagation()
      }}
      data-cy="Modal"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        {giftAmount.DEFE || giftAmount.ETH ? (
          <Box sx={{ position: 'relative', outline: 'none', transform: { xs: 'scale(0.5)', lg: 'unset' }, height: '656px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ transform: `translateX(-37px)`, position: 'absolute', top: '11px', zIndex: -1 }}>
              <Box
                component="img"
                src={imageMap.cryptoBox.cryptoBoxGiftHead}
                alt=""
                sx={{
                  width: '309px',
                  height: '216px',
                  ...active,
                }}
              />
            </Box>
            {giftAmount.DEFE && !giftAmount.ETH ? (
              <Box
                component="img"
                src={imageMap.cryptoBox.giftDefeLeftSideIcon}
                sx={{
                  ...active,
                  width: '110px',
                  height: '110px',
                  position: 'absolute',
                  left: '0px',
                  top: '240px',
                  zIndex: 2,
                }}
              />
            ) : null}
            {giftAmount.DEFE && !giftAmount.ETH ? (
              <Box
                component="img"
                src={imageMap.cryptoBox.giftDefeRightSideIcon}
                sx={{
                  ...active,
                  width: '110px',
                  height: '110px',
                  position: 'absolute',
                  left: '216px',
                  top: '226px',
                  zIndex: 2,
                }}
              />
            ) : null}
            {giftAmount.DEFE && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#ffffff',
                  position: 'absolute',
                  top: '202.5px',
                  left: !giftAmount.ETH ? 'unset' : '8.5px',
                  zIndex: 2,
                }}
              >
                <Box
                  component="img"
                  src={imageMap.cryptoBox.giftDefe}
                  sx={{
                    ...active,
                    width: '100px',
                    height: '100px',
                    marginBottom: '10px',
                  }}
                />
                <HeadBox
                  sx={{
                    ...baseCss,
                    border: '1px solid #13D9FF',
                    background: 'linear-gradient(270deg, #1796EC -0.68%, rgba(47, 204, 253, 0.6) 100%)',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      textAlign: 'center',
                    }}
                  >
                    {giftAmount.DEFE.toFixed(2)}
                  </Box>
                  <Box
                    sx={{
                      flexShrink: 0,
                      fontSize: '16px',
                      fontWeight: 500,
                    }}
                  >
                    DEFE
                  </Box>
                </HeadBox>
              </Box>
            )}
            {!!giftAmount.ETH && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ffffff', position: 'absolute', top: '164.25px', left: '197px', zIndex: 2 }}>
                <Box
                  component="img"
                  src={imageMap.cryptoBox.giftEth}
                  sx={{
                    ...active,
                    width: '100px',
                    height: '100px',
                    marginBottom: '10px',
                  }}
                />
                <HeadBox
                  sx={{
                    ...baseCss,
                    border: '1px solid #B894FF',
                    background: 'linear-gradient(270deg, #7E79E2 -0.68%, rgba(180, 201, 255, 0.7) 100%)',
                  }}
                >
                  <Box sx={{ flex: 1, overflow: 'hidden', textAlign: 'center' }}>{giftAmount.ETH.toFixed(4)}</Box>
                  <Box
                    sx={{
                      flexShrink: 0,
                      fontSize: '16px',
                      fontWeight: 500,
                    }}
                    component="span"
                  >
                    ETH
                  </Box>
                </HeadBox>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', position: 'absolute', top: '325px', zIndex: 1 }}>
              <ShakeImgUp src={imageMap.cryptoBox.animation1} alt="" height="63px" />
              <ShakeImgDown src={imageMap.cryptoBox.animation2} alt="" height="33px" />
              <ShakeImgUp src={imageMap.cryptoBox.animation3} alt="" height="46px" />
              <ShakeImgDown src={imageMap.cryptoBox.animation4} alt="" height="36px" />
              <ShakeImgUp src={imageMap.cryptoBox.animation5} alt="" height="52px" />
              <ShakeImgDown src={imageMap.cryptoBox.animation6} alt="" height="35px" />
              <ShakeImgDown src={imageMap.cryptoBox.animation7} alt="" height="44px" />
            </Box>
            <Box
              component="img"
              src={imageMap.cryptoBox.giftContent}
              alt=""
              sx={{
                width: '318px',
                height: '233px',
                marginTop: '356px',
              }}
            />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="purple" sx={{ width: '160px', py: 3 }} onClick={() => setCryptoBoxModalVisible(false)}>
                {t('OK')}
              </Button>
            </Box>
          </Box>
        ) : (
          <Image src={imageMap.cryptoBox.cryptoBoxBg} alt="" height={isMobile ? 240 : 360} />
        )}
      </Box>
    </Modal>
  )
}
export default observer(CryptoBoxModal)
