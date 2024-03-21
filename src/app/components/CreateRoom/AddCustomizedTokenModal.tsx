import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import { Box, Button, ButtonBase, Fade, Modal, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { gsap, Power4 } from 'gsap'
import { AxiosResponse } from 'axios'
import { useMobxStore } from '../../../stores/StoreProvider'
import CloseIcon from '../../../../public/res/svg/common/common_outline_close_icon_without_circle.svg?react'
import { request } from '../../../api/request'
import DefedApi, { IGetTokenInfoResponse, IResponseType } from '../../../api/defed-api'
import snackbarUtils from '../../../util/SnackbarUtils'
import commonImageMap from '../../../images/commonImageMap'
import { GroupConditionConfigChain } from '../../../stores/app-store'

const AddCustomizedTokenModal: React.FC = () => {
  const { t } = useTranslation()
  const {
    appStore: { initGroupConfig, groupConditionsConfig },
    modalStore: { addCustomizedTokenConditionPreInfo, changeAddCustomizedTokenConditionPreInfo, addCustomizedTokenConditionAction },
  } = useMobxStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tokenDetailPartRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<0 | 1>(0)
  const animationRef = useRef<gsap.core.Timeline>()
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [targetTokenInfo, setTargetTokenInfo] = useState<IGetTokenInfoResponse>()
  const imageRef = useRef<HTMLImageElement>()
  const onCloseModal = () => {
    changeAddCustomizedTokenConditionPreInfo(undefined)
  }
  const onBackButtonClick = () => {
    if (step === 0) {
      onCloseModal()
    } else {
      if (!animationRef.current) return
      animationRef.current.reverse()
    }
  }
  const addCustomizedToken = async (imageCid?: string) => {
    if (!inputRef.current || !inputRef.current.value) return
    if (!addCustomizedTokenConditionPreInfo) return
    if (!targetTokenInfo) return
    const requestData = {
      network: addCustomizedTokenConditionPreInfo.network,
      networkLogo: addCustomizedTokenConditionPreInfo.network_logo,
      type: 'erc20',
      address: inputRef.current.value,
      symbol: targetTokenInfo.symbol,
      decimals: targetTokenInfo.decimals,
      tokenLogo: imageCid,
    }
    const addResult: AxiosResponse<IResponseType<boolean>> = await request.post(DefedApi.addGroupConfigInfo, requestData)
    if (addResult?.data?.data) {
      const newGroupConfig = (await initGroupConfig()) as unknown as Array<GroupConditionConfigChain>
      if (!Array.isArray(newGroupConfig)) {
        return
      }
      const currentChain = newGroupConfig.find((item) => item.id === addCustomizedTokenConditionPreInfo.id)
      if (!currentChain) {
        return
      }
      const currentToken = currentChain.list.find((item) => item.address === (inputRef.current as HTMLInputElement).value)
      if (!currentToken) {
        return
      }
      addCustomizedTokenConditionAction &&
        addCustomizedTokenConditionAction({
          chain: currentChain.id,
          token: currentToken.id,
          amount: undefined,
        })
      changeAddCustomizedTokenConditionPreInfo(undefined)
      snackbarUtils.success(t('Add token successfully!'))
    }
    snackbarUtils.error(addResult?.data?.msg || t('Add token failed!'))
  }
  const onNextButtonClick = async () => {
    if (step === 0) {
      if (!addCustomizedTokenConditionPreInfo) return
      if (!inputRef.current || !inputRef.current.value) return
      const currentChain = groupConditionsConfig.find((item) => item.id === addCustomizedTokenConditionPreInfo.id)
      if (!currentChain) return snackbarUtils.error(t("Chain doesn't exist!"))
      const alreadyExistToken = currentChain.list.find((item) => item.address === (inputRef.current as HTMLInputElement).value)
      if (alreadyExistToken) {
        return snackbarUtils.error(t('Token already exists!'))
      }
      setIsAnimating(true)
      const getTokenInfoResult: AxiosResponse<IResponseType<IGetTokenInfoResponse>> = await request.get(DefedApi.getTokenInfo, {
        params: {
          network: addCustomizedTokenConditionPreInfo.network,
          address: inputRef.current.value,
        },
      })
      if (getTokenInfoResult?.data?.data?.symbol) {
        setTargetTokenInfo(getTokenInfoResult.data.data)
        if (!animationRef.current) {
          const tl = gsap.timeline({
            onStart: () => {
              setIsAnimating(true)
            },
            onComplete: () => {
              setStep(1)
              setIsAnimating(false)
            },
            onReverseComplete: () => {
              setStep(0)
              setIsAnimating(false)
            },
          })
          tl.to(inputContainerRef.current, {
            opacity: 0,
            duration: 0.3,
          })
          tl.to(
            tokenDetailPartRef.current,
            {
              x: 0,
              opacity: 1,
              duration: 0.3,
              ease: Power4.easeIn,
            },
            '-=0.1',
          )
          animationRef.current = tl
        } else {
          animationRef.current.play()
        }
      } else {
        snackbarUtils.error(getTokenInfoResult?.data?.msg || t('Wrong token address!'))
        setIsAnimating(false)
      }
    } else {
      if (!targetTokenInfo) return
      setIsAnimating(true)
      try {
        if (targetTokenInfo.logo && imageRef.current) {
          const response = await fetch(targetTokenInfo.logo)
          const blob = await response.blob()
          const file = new File([blob], 'test.png', { type: blob.type })
          const formData = new FormData()
          formData.append('file', file, file.name)
          const result: AxiosResponse<
            IResponseType<{
              imageCid: string
              compressImageCid: string
            }>
          > = await request.post(DefedApi.uploadImage, formData)
          if (result?.data?.data?.imageCid) {
            await addCustomizedToken(result.data.data.imageCid)
          }
        } else {
          await addCustomizedToken()
        }
      } catch (e) {
        console.error(e)
        setIsAnimating(false)
      }
    }
  }
  return (
    <Modal
      open
      onClose={onCloseModal}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '343px', xsm: '492px' },
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: { xs: `24px 16px`, xsm: '16px' },
          }}
          ref={containerRef}
        >
          <Box
            sx={{
              color: '#474746',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            {t('Token contract address')}
            <ButtonBase onClick={onCloseModal}>
              <CloseIcon
                style={{
                  width: '20px',
                  height: '20px',
                  fill: '#474746',
                }}
              />
            </ButtonBase>
          </Box>
          <Box
            sx={{
              width: '100%',
              marginBottom: '16px',
              position: 'relative',
            }}
          >
            <TextField
              placeholder={t('Enter the token smart contract address here')}
              fullWidth
              inputProps={{
                sx: {
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: { xs: '20px', xsm: '24px' },
                },
              }}
              inputRef={inputRef}
              ref={inputContainerRef}
            />
            <Box
              ref={tokenDetailPartRef}
              sx={{
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translateX(100%)',
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                height: '56px',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#848484',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                }}
              >
                <Box
                  sx={{
                    marginBottom: '8px',
                  }}
                >
                  {t('Logo')}
                </Box>
                <Box
                  component="img"
                  sx={{
                    width: '28px',
                    height: '28px',
                  }}
                  src={targetTokenInfo?.logo || commonImageMap.commonFullFilledQuestionMarkIcon}
                  ref={imageRef}
                />
              </Box>
              <Box
                sx={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: '#EEEEEE',
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#848484',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                }}
              >
                <Box
                  sx={{
                    marginBottom: '12px',
                  }}
                >
                  {t('Symbol')}
                </Box>
                <Box
                  sx={{
                    color: '#474746',
                    width: '100%',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'pre',
                    padding: '0 4px',
                    textAlign: 'center',
                  }}
                  title={targetTokenInfo?.symbol}
                >
                  {targetTokenInfo?.symbol}
                </Box>
              </Box>
              <Box
                sx={{
                  width: '1px',
                  height: '24px',
                  backgroundColor: '#EEEEEE',
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#848484',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                }}
              >
                <Box
                  sx={{
                    marginBottom: '12px',
                  }}
                >
                  {t('Decimal')}
                </Box>
                <Box
                  sx={{
                    color: '#474746',
                  }}
                >
                  {targetTokenInfo?.decimals}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button
              sx={{
                width: '78px',
                height: '46px',
                marginRight: '18px',
                borderRadius: '8px',
                border: '1px solid #5372DD',
                padding: '10px 12px',
                color: '#5372DD',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
              }}
              onClick={onBackButtonClick}
              disabled={step === 1 && isAnimating}
            >
              {step === 0 ? t('Close') : t('Back')}
            </Button>
            <Button
              sx={{
                width: '78px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#5372DD',
                color: '#FFFFFF',
                padding: '10px 12px',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                '&:hover': {
                  opacity: 0.8,
                  backgroundColor: '#5372DD',
                },
              }}
              onClick={onNextButtonClick}
              disabled={isAnimating}
            >
              {step === 0 ? t('Next') : t('Add')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(AddCustomizedTokenModal)
