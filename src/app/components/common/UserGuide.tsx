import { observer } from 'mobx-react-lite'
import React, { MutableRefObject, useRef, useState } from 'react'
import { Box, Button, ButtonBase } from '@mui/material'
import Joyride, { Callback, STATUS, Step, StoreHelpers } from 'react-joyride'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { useTranslation } from 'react-i18next'
import { useMobxStore } from '../../../stores/StoreProvider'
import CloseIcon from '../../../../public/res/svg/common/common_fullfilled_close_icon.svg?react'
import { USER_GUIDE_FLAG_KEY } from '../../../stores/user-relationship-store'

interface IGuideContentProps {
  helpersRef: MutableRefObject<StoreHelpers | undefined>
}
const GuideContent: React.FC<IGuideContentProps> = ({ helpersRef }) => {
  const { t } = useTranslation()
  const swiperRef = useRef<SwiperClass>(null)
  const [swiperIndex, setSwiperIndex] = useState<number>(0)
  const handleSlideChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.activeIndex)
  }

  const goNext = () => {
    if (!swiperRef.current) return
    swiperRef.current.slideNext()
  }

  const goToSlide = (index: number) => {
    if (!swiperRef.current) return
    swiperRef.current.slideTo(index)
  }
  const onCloseButtonClick = () => {
    if (helpersRef.current) {
      helpersRef.current.close()
    }
  }
  return (
    <Box
      sx={{
        width: '676px',
        height: '570px',
        borderRadius: '16px',
        position: 'relative',
        padding: '32px',
      }}
    >
      <ButtonBase
        style={{
          position: 'absolute',
          top: '-36px',
          right: '-36px',
          borderRadius: '18px',
        }}
        onClick={onCloseButtonClick}
      >
        <CloseIcon
          style={{
            width: '36px',
            height: '36px',
          }}
        />
      </ButtonBase>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '24px',
        }}
      >
        <Swiper
          pagination={false}
          direction="horizontal"
          slidesPerView={1}
          style={{
            width: '612px',
          }}
          simulateTouch={false}
          initialSlide={0}
          onSwiper={(swiper: SwiperClass) => {
            swiperRef.current = swiper
          }}
          onSlideChange={handleSlideChange}
        >
          <SwiperSlide>
            <Box
              sx={{
                width: '612px',
                height: '338px',
                borderRadius: '16px',
              }}
              component="img"
              src="https://defed.mypinata.cloud/ipfs/QmQJU7aP4hL3LYhgTWNMupspEVFhy8DfAmTSVrU8YeLvHq"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                width: '612px',
                height: '338px',
                borderRadius: '16px',
              }}
              component="img"
              src="https://defed.mypinata.cloud/ipfs/QmTaaZtjxTKHtbCb2DgVU6eRCGK9droi242XJ9mVComNhQ"
            />
          </SwiperSlide>
        </Swiper>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          lineHeight: '24px',
          color: '#23282D',
          fontWeight: 400,
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        {swiperIndex === 0 ? (
          <Box
            sx={{
              maxWidth: '589px',
            }}
          >
            {t('Click "Add direct message", you can search or message your contacts')}
          </Box>
        ) : (
          <Box
            sx={{
              maxWidth: '589px',
            }}
          >
            {t('Select the group chat that needs to be migrated and click "Create", and your group members will receive an invitation to join the group')}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          '& > button': {
            width: '8px',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: '#4128D1',
          },
        }}
      >
        <ButtonBase
          sx={{ marginRight: '16px', opacity: swiperIndex === 0 ? 1 : 0.1 }}
          onClick={() => {
            goToSlide(0)
          }}
        />
        <ButtonBase
          sx={{ opacity: swiperIndex === 1 ? 1 : 0.1 }}
          onClick={() => {
            goToSlide(1)
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {swiperIndex === 0 ? (
          <>
            <Button
              sx={{
                marginRight: '24px',
                width: '204px',
                height: '56px',
                border: '1px solid #4128D1',
                color: '#4128D1',
              }}
              onClick={onCloseButtonClick}
            >
              {t('Skip')}
            </Button>
            <Button
              sx={{
                width: '384px',
                height: '56px',
                backgroundColor: '#4128D1',
                color: '#FFF',
              }}
              variant="surface"
              onClick={goNext}
            >
              {t('Next')}
            </Button>
          </>
        ) : (
          <Button
            sx={{
              width: '384px',
              height: '56px',
              backgroundColor: '#4128D1',
              color: '#FFF',
            }}
            variant="surface"
            onClick={onCloseButtonClick}
          >
            {t('I already know')}
          </Button>
        )}
      </Box>
    </Box>
  )
}
const UserGuide: React.FC = () => {
  const {
    modalStore: { changeUserGuideVisible },
  } = useMobxStore()
  const helpersRef = useRef<StoreHelpers>()
  const onUserGuideCallback: Callback = (data) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      console.log('用户引导已经被关闭')
      window.localStorage.setItem(USER_GUIDE_FLAG_KEY, 'true')
      changeUserGuideVisible(false)
    }
  }
  const steps: Array<Step> = [
    {
      target: '.user-guide-first-step',
      content: <GuideContent helpersRef={helpersRef} />,
      disableBeacon: true,
      placement: 'bottom-start',
      isFixed: true,
      hideFooter: true,
    },
  ]
  return (
    <Box>
      <Joyride
        disableOverlayClose
        spotlightPadding={1}
        floaterProps={{
          hideArrow: false,
        }}
        steps={steps}
        callback={onUserGuideCallback}
        styles={{
          options: {
            zIndex: 1000,
          },
          tooltip: {
            width: 'auto',
            padding: 0,
          },
          tooltipContent: {
            padding: 0,
          },
          spotlight: {},
        }}
        getHelpers={(helpers) => {
          helpersRef.current = helpers
        }}
        hideCloseButton
      />
    </Box>
  )
}
export default observer(UserGuide)
