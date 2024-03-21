import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box, Fade, Modal, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface ICommonConfirmModalProps {
  content?: string
  open: boolean
  onCloseModal: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void
  onConfirmButtonClick?: Function
  onCancelButtonClick?: Function
}

const CommonConfirmModal: React.FC<ICommonConfirmModalProps> = ({ content, open, onCloseModal, onConfirmButtonClick, onCancelButtonClick }) => {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '300px', xsm: '400px' },
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: { xs: `${'24px'} ${'16px'}`, xsm: '24px' },
          }}
        >
          <Box
            sx={{
              width: '100%',
              marginBottom: '24px',
            }}
          >
            {content || t('Are you sure you want to persist?')}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              sx={{
                color: 'red',
                marginRight: '16px',
              }}
              onClick={() => {
                if (onCancelButtonClick) {
                  onCancelButtonClick()
                } else {
                  onCloseModal({}, 'backdropClick')
                }
              }}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="surface"
              onClick={() => {
                if (onConfirmButtonClick) {
                  onConfirmButtonClick()
                } else {
                  onCloseModal({}, 'backdropClick')
                }
              }}
            >
              {t('Confirm')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(CommonConfirmModal)
