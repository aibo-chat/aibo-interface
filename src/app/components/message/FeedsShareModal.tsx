import { observer } from 'mobx-react-lite'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, ButtonBase, Fade, Modal, Link } from '@mui/material'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import throttle from 'lodash/throttle'
import DefedLogo from '../../../../public/res/svg/feeds_news/defed_logo.svg?react'
import DiscordIcon from '../../../../public/res/svg/feeds_news/feed_share_modal_discord_icon.svg?react'
import TelegramIcon from '../../../../public/res/svg/feeds_news/feed_share_modal_telegram_icon.svg?react'
import TwitterIcon from '../../../../public/res/svg/feeds_news/feed_share_modal_twitter_icon.svg?react'
import DownloadIcon from '../../../../public/res/svg/feeds_news/feed_share_modal_download_icon.svg?react'
import CloseIcon from '../../../../public/res/svg/common/common_fullfilled_close_icon.svg?react'
import { isProduction } from '../../../constant'
import snackbarUtils from '../../../util/SnackbarUtils'
import { dataURLtoFile, formatTime, postUploadPicture } from '../../utils/common'
import FeedsNewsImageMap from '../../../images/feedsNewsImageMap'
import { useMobxStore } from '../../../stores/StoreProvider'
import { FeedsSingleNewsNecessaryData } from './FeedsSingleNews'

const TEST_DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1122740062149431357/QeG3RIUFZJEWiAaE25hILAdBtd3U4extko_uObE1ndLFRHLBeArrYWgbGE-1kfXs-PZF'
const TEST_DISCORD_CHANNEL = 'https://discord.gg/BtYenZRtux'

const PROD_DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1195274099438657567/e8xz2nHFFF6WEhOIlQs7y9RRHcyTM91DCpK6jy0me2LYUG0vdngv91MazxqCVCxvxPyh'
const PROD_DISCORD_CHANNEL = 'https://discord.gg/xKh8GpHk'
const DISCORD_CHANNEL = isProduction ? PROD_DISCORD_CHANNEL : TEST_DISCORD_CHANNEL
const DISCORD_WEBHOOK = isProduction ? PROD_DISCORD_WEBHOOK : TEST_DISCORD_WEBHOOK
interface IFeedsShareModalProps {
  isMobile?: boolean
}
function ImageButton({ children, onClick, disable }: { children: ReactNode; onClick?: () => void; disable?: boolean }) {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: disable ? 'default' : 'pointer',
        opacity: disable ? '0.5' : '1',
        ':hover': {
          opacity: disable ? '0.5' : '0.8',
        },
      }}
      onClick={() => {
        if (disable) return
        onClick?.()
      }}
    >
      {children}
    </Box>
  )
}
const SHARE_URL = 'https://defed.network/'
const NORMAL_TEXT = 'Join DEFED to find more web3 news!'
const ImagePlaceholderArray = [
  FeedsNewsImageMap.feedShareModalImagePlaceholder1,
  FeedsNewsImageMap.feedShareModalImagePlaceholder2,
  FeedsNewsImageMap.feedShareModalImagePlaceholder3,
  FeedsNewsImageMap.feedShareModalImagePlaceholder4,
  FeedsNewsImageMap.feedShareModalImagePlaceholder5,
]
const FeedsShareModal: React.FC<IFeedsShareModalProps> = ({ isMobile }) => {
  const {
    modalStore: { feedToShare, changeFeedToShare },
  } = useMobxStore()
  const { timestamp, title, summary, tags, image_url: imageUrl } = feedToShare as FeedsSingleNewsNecessaryData
  const { t } = useTranslation()
  const pictureRef = useRef<HTMLDivElement>()
  const [finalImageSrc, setFinalImageSrc] = useState<string>('')
  // const [sayHiButtonLoading, setSayHiButtonLoading] = useState<boolean>(false)
  const [downloadButtonLoading, setDownloadButtonLoading] = useState<boolean>(false)
  const [discordButtonLoading, setDiscordButtonLoading] = useState<boolean>(false)
  const [imagePlaceHolder, setImagePlaceHolder] = useState<string>('')

  useEffect(() => {
    const random = Math.floor(Math.random() * 5)
    setImagePlaceHolder(ImagePlaceholderArray[random])
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        // 将Blob对象转换为DataURL
        const dataUrl = URL.createObjectURL(blob)

        // 创建一个canvas并将图片绘制到画布上
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.drawImage(dataUrl as unknown as CanvasImageSource, 0, 0, canvas.width, canvas.height)
        // 将canvas转换为图像
        const image = new Image()
        const resultUrl = canvas.toDataURL('image/png')
        image.onload = function () {
          setFinalImageSrc(resultUrl)
          // 请求成功，说明图片不受跨域政策保护
          console.log('Image is not protected by CORS policy.')
        }
        image.src = resultUrl
      })
      .catch(() => {
        // 请求失败，说明图片受到跨域政策保护
        console.log('Image is protected by CORS policy.')
      })
  }, [])
  const onCloseModal = () => {
    changeFeedToShare(undefined)
  }
  const downloadImage = throttle(async () => {
    if (!pictureRef.current) return
    setDownloadButtonLoading(true)
    try {
      const canvas = await html2canvas(pictureRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const imageSrc = canvas.toDataURL()
      const aLink = document.createElement('a')
      aLink.style.display = 'none'
      aLink.href = imageSrc
      aLink.download = 'DEFED_FEEDS_SHARE_IMAGE.png'
      document.body.appendChild(aLink)
      aLink.click()
      document.body.removeChild(aLink)
    } catch (e) {
      snackbarUtils.error(t('Download error'))
      console.error(e)
    }
    setDownloadButtonLoading(false)
  }, 500)

  // const shareToSayHi = throttle(async () => {
  //   if (!pictureRef.current) return
  //   const targetConversation = conversationList.find((item) => item.name === 'Say Hi')
  //   if (!targetConversation) return snackbarUtils.error('You are not in Say hi yet!')
  //   setSayHiButtonLoading(true)
  //   try {
  //     const canvas = await html2canvas(pictureRef.current, {
  //       allowTaint: true,
  //       useCORS: true,
  //       backgroundColor: null,
  //       logging: false,
  //     })
  //     const imageSrc = canvas.toDataURL()
  //     const file = dataURLtoFile(imageSrc, 'SBT.png')
  //     const formData = new FormData()
  //     formData.append('file', file, file.name)
  //     const result: {
  //       imageCid: string
  //       compressImageCid: string
  //     } = await request.post(api.post_ipfs_upload_image, formData)
  //     if ((result as any)?.msg) {
  //       snackbarUtils.error((result as any).msg)
  //     } else {
  //       const newContent: ChatImageMessageContent = {
  //         url: result.imageCid,
  //         urlCompressed: result.compressImageCid,
  //         width: pictureRef.current.offsetWidth,
  //         height: pictureRef.current.offsetHeight,
  //       }
  //       const resultMsg = await sendMessage(userData.proxyAddress, targetConversation, ChatMessageType.Image, newContent, Date.now())
  //       handleMessage(targetConversation.topic, resultMsg)
  //       snackbarUtils.success(t('Share success'))
  //     }
  //   } catch (e) {
  //     console.error(e)
  //     snackbarUtils.error(t('Share error'))
  //   }
  //   setSayHiButtonLoading(false)
  // }, 500)
  const shareToDiscord = throttle(async () => {
    if (!pictureRef.current) return
    setDiscordButtonLoading(true)
    try {
      const canvas = await html2canvas(pictureRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const imageSrc = canvas.toDataURL()
      const file = dataURLtoFile(imageSrc, 'SBT.png')
      // 将海报文件上传到服务器，获取url
      const dataUrl = await postUploadPicture(file)

      // 创建HTTP请求
      const request = new XMLHttpRequest()
      request.open('POST', DISCORD_WEBHOOK)
      request.setRequestHeader('Content-Type', 'application/json')
      const payload = {
        content: SHARE_URL,
        // name: cardData?.handleName,
        // avatar: cardData?.avatarLink!,
        embeds: [
          {
            image: {
              url: dataUrl,
            },
          },
        ],
      }
      // 发送请求，将消息推到discord，并跳转到对应的 channel
      request.send(JSON.stringify(payload))
      window.open(DISCORD_CHANNEL)
    } catch (e) {
      snackbarUtils.error(t('Share error'))
      console.error(e)
    }
    setDiscordButtonLoading(false)
  }, 500)
  return (
    <Modal
      open
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      onClose={isMobile ? undefined : onCloseModal}
      closeAfterTransition
    >
      <Fade in>
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 0, lg: '50%' },
            left: { xs: 0, lg: '50%' },
            transform: { xs: 'none', lg: 'translate(-50%, -50%)' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '100%', lg: '448px' },
            backgroundColor: { xs: 'transparent', lg: '#fff' },
            borderRadius: { lg: '16px', xs: 0 },
            height: { lg: 'auto', xs: '100%' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              padding: { xs: '36px 16px', lg: '16px' },
              overflowX: { lg: 'visible', xs: 'hidden' },
              overflowY: { lg: 'visible', xs: 'auto' },
              flex: 1,
              display: 'flex',
              justifyContent: 'stretch',
              position: 'relative',
            }}
          >
            <ButtonBase
              sx={{
                position: { lg: 'absolute', xs: 'fixed' },
                top: { lg: -34, xs: 4 },
                right: { lg: -34, xs: 4 },
                zIndex: 1,
              }}
              onClick={onCloseModal}
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
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                position: 'relative',
                height: { lg: '650px', xs: '650px' },
              }}
              ref={pictureRef}
            >
              <Box
                component="img"
                sx={{
                  width: { lg: '486px', xs: '100%' },
                  height: { lg: '650px', xs: '100%' },
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: -1,
                }}
                src={FeedsNewsImageMap.feedShareModalBackground}
              />
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginBottom: '12px',
                  flexShrink: 0,
                }}
              >
                <DefedLogo
                  style={{
                    width: '68px',
                    height: '13px',
                  }}
                />
              </Box>
              <Box sx={{ fontSize: '18px', fontWeight: 500, lineHeight: '24px', width: '100%', flexShrink: 0 }}>{title}</Box>
              <Box
                sx={{
                  display: 'flex',
                  fontSize: '12px',
                  marginTop: '8px',
                  marginBottom: '12px',
                  color: '#4128D1',
                  flexWrap: 'wrap',
                  flexShrink: 0,
                }}
              >
                {tags.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      borderRadius: '90px',
                      bgcolor: '#F3F1FC',
                      p: '4px 8px',
                      mr: 2,
                      mt: 2,
                      whiteSpace: 'nowrap',
                      fontSize: '10px',
                    }}
                  >
                    {item}
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  width: '100%',
                  color: '#BFC6CD',
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  marginBottom: '12px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {formatTime(timestamp)}
              </Box>
              <Box
                component="img"
                src={finalImageSrc || imagePlaceHolder}
                sx={{
                  width: '100%',
                  height: { lg: '200px', xs: '161px' },
                  borderRadius: { lg: '8px', xs: '12px' },
                  overflow: 'hidden',
                  marginBottom: { lg: '16px', xs: '12px' },
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{
                  width: '100%',
                  flex: 1,
                  overflow: 'hidden',
                  fontSize: { lg: '12px', xs: '14px' },
                  maskImage: 'linear-gradient(180deg,#000 0%,transparent 94%)',
                  maskSize: '100%',
                  maskPosition: '0px',
                  color: { lg: '#141414', xs: '#78828C' },
                }}
              >
                {summary}
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#EBF0F5',
                  marginBottom: '20px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="img"
                  src={FeedsNewsImageMap.feedsShareModalMoreSummaryIcon}
                  sx={{
                    width: '22px',
                    height: '22px',
                    position: 'absolute',
                    bottom: { lg: '-16px', xs: '-10px' },
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    flex: 1,
                    overflow: 'hidden',
                    marginRight: '5px',
                  }}
                >
                  <DefedLogo
                    style={{
                      width: '78px',
                      height: '15px',
                      marginBottom: '12px',
                    }}
                  />
                  <Box
                    sx={{
                      fontSize: { lg: '10px', xs: '12px' },
                      fontWeight: 400,
                      lineHeight: { lg: '20px', xs: '16px' },
                      color: '#78828C',
                    }}
                  >
                    {t('Disclaimer: Platform contains 3rd party content. Not endorsement. Join DEDED for more Web3 news.')}
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '7px',
                    border: '1.611px solid var(--text-background-7, #EBF0F5)',
                    flexShrink: 0,
                    padding: '2px',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                    }}
                    component="img"
                    src={FeedsNewsImageMap.feedShareModalQrcode}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              flexShrink: 0,
              height: { lg: '80px', xs: 'auto' },
              backgroundColor: { lg: '#F3F1FC', xs: '#FFFFFF' },
              borderBottomLeftRadius: { xs: 0, lg: '16px' },
              borderBottomRightRadius: { xs: 0, lg: '16px' },
              borderTopLeftRadius: { xs: '16px', lg: 0 },
              borderTopRightRadius: { xs: '16px', lg: 0 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: { lg: 'center', xs: 'normal' },
              padding: { lg: '0 70px', xs: '24px 60px' },
              position: { lg: 'static', xs: 'relative' },
            }}
          >
            {/* <ImageButton onClick={shareToSayHi} disable={sayHiButtonLoading}> */}
            {/*  <ChatIcon /> */}
            {/* </ImageButton> */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <ImageButton onClick={shareToDiscord} disable={discordButtonLoading}>
                <DiscordIcon />
              </ImageButton>
              <Link href={`https://twitter.com/intent/tweet?url=${SHARE_URL}&text=${NORMAL_TEXT}`} target="_blank">
                <ImageButton>
                  <TwitterIcon />
                </ImageButton>
              </Link>
              <Link href={`https://t.me/share/url?url=${SHARE_URL}&text=${NORMAL_TEXT}`} target="_blank">
                <ImageButton>
                  <TelegramIcon />
                </ImageButton>
              </Link>
              <ImageButton onClick={downloadImage} disable={downloadButtonLoading}>
                <DownloadIcon
                  style={{
                    fill: isMobile ? '#F4F6F9' : '#FFF',
                  }}
                />
              </ImageButton>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(FeedsShareModal)
