import React, { useEffect } from 'react'
import './RawModal.scss'

import Modal, { OnAfterOpenCallback } from 'react-modal'

import navigation from '../../../client/state/navigation'

Modal.setAppElement('#root')

interface IRawModalProps {
  className?: string
  overlayClassName?: string
  isOpen: boolean
  size?: 'large' | 'medium' | 'small'
  onAfterOpen?: OnAfterOpenCallback
  onAfterClose?: () => void
  onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
  closeFromOutside?: boolean
  children: any
}
const RawModal: React.FC<IRawModalProps> = ({ className, overlayClassName, isOpen, size = 'small', onAfterOpen, onAfterClose, onRequestClose, closeFromOutside = true, children }) => {
  let modalClass = className !== null ? `${className} ` : ''
  switch (size) {
    case 'large':
      modalClass += 'raw-modal__large '
      break
    case 'medium':
      modalClass += 'raw-modal__medium '
      break
    case 'small':
    default:
      modalClass += 'raw-modal__small '
  }

  useEffect(() => {
    navigation.setIsRawModalVisible(isOpen)
  }, [isOpen])

  const modalOverlayClass = overlayClassName !== null ? `${overlayClassName} ` : ''
  return (
    <Modal
      className={`${modalClass}raw-modal`}
      overlayClassName={`${modalOverlayClass}raw-modal__overlay`}
      isOpen={isOpen}
      onAfterOpen={onAfterOpen}
      onAfterClose={onAfterClose}
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={closeFromOutside}
      shouldCloseOnOverlayClick={closeFromOutside}
      shouldReturnFocusAfterClose={false}
    >
      {children}
    </Modal>
  )
}

export default RawModal
