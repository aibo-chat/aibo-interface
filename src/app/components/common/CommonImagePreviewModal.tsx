import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box, Fade, Modal } from '@mui/material'
import { useMobxStore } from '../../../stores/StoreProvider'
import { ImageViewer } from '../image-viewer'

const CommonImagePreviewModal: React.FC<any> = () => {
  const {
    modalStore: { imagePreviewSrc, changeImagePreviewSrc },
  } = useMobxStore()
  const requestClose = () => {
    changeImagePreviewSrc('')
  }
  return (
    <Modal
      open
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      // onClose={handleClose}
      closeAfterTransition
    >
      <Fade in>
        <Box
          sx={{
            width: '80vw',
            height: '80vh',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <ImageViewer src={imagePreviewSrc as string} alt={imagePreviewSrc as string} requestClose={requestClose} />
        </Box>
      </Fade>
    </Modal>
  )
}
export default observer(CommonImagePreviewModal)
