import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { AxiosResponse } from 'axios'
import { request } from '../../../api/request'
import snackbarUtils from '../../../util/SnackbarUtils'
import DefedApi, { IResponseType } from '../../../api/defed-api'

interface IFeedsModalTranslationPartProps {
  translationLanguage: string
  articleId: string
  isMobile?: boolean
  articleType?: 'article' | 'digest'
}

const FeedsNewsTranslationPart: React.FC<IFeedsModalTranslationPartProps> = ({ articleId, translationLanguage, isMobile, articleType = 'article' }) => {
  const { t } = useTranslation()
  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  const [translationResult, setTranslationResult] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>()
  const initData = async () => {
    if (translationLanguage && articleId) {
      if (containerRef.current) {
        containerRef.current?.scrollIntoView({
          behavior: 'auto',
          block: isMobile ? 'center' : 'start',
        })
      }
      setIsTranslating(true)
      try {
        const result: AxiosResponse<IResponseType<string | undefined>> = await request.post(DefedApi.postTranslate, {
          articleId,
          language: translationLanguage,
          articleType,
        })
        if (typeof result.data.data === 'string') {
          setTranslationResult(result.data.data)
        } else if (result?.data?.msg) {
          snackbarUtils.error((result as AxiosResponse<{ code: number; msg: string }>).data.msg)
        }
      } catch (e) {
        snackbarUtils.error(t('Translate error'))
        console.error(e)
      }
      setIsTranslating(false)
    }
  }
  useEffect(() => {
    initData()
  }, [translationLanguage])
  return (
    <Box
      sx={{
        width: '100%',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: '#141414',
        flexShrink: 0,
        marginTop: { xs: '12px', lg: '0px' },
      }}
      ref={containerRef}
    >
      <Box
        sx={{
          width: '100%',
          height: '1px',
          backgroundColor: '#EBF0F5',
          flexShrink: 0,
          marginBottom: { xs: '12px', lg: '16px' },
        }}
      />
      <Box
        sx={{
          color: '#78828C',
          lineHeight: '14px',
          marginBottom: { lg: '8px', xs: '10px' },
        }}
      >
        {t('Translation')}:
      </Box>
      <Box
        sx={{
          width: '100%',
          marginBottom: { lg: '16px', xs: '12px' },
          color: { xs: '#78828C', lg: '#141414' },
        }}
      >
        {isTranslating ? <CircularProgress color="inherit" size="14px" /> : translationResult}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: { lg: '0px', xs: '1px' },
          backgroundColor: '#EBF0F5',
          flexShrink: 0,
        }}
      />
    </Box>
  )
}
export default observer(FeedsNewsTranslationPart)
