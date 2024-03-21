import React from 'react'
import './Dialog.scss'

import { OnAfterOpenCallback } from 'react-modal'
import { twemojify } from '../../../util/twemojify'

import Text from '../../atoms/text/Text'
import Header, { TitleWrapper } from '../../atoms/header/Header'
import ScrollView from '../../atoms/scroll/ScrollView'
import RawModal from '../../atoms/modal/RawModal'

interface IDialogProps {
  className?: string
  isOpen: boolean
  title: React.ReactNode
  contentOptions?: React.ReactElement
  onAfterOpen?: OnAfterOpenCallback
  onAfterClose?: () => void
  onRequestClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
  closeFromOutside?: boolean
  children: any
  invisibleScroll?: boolean
}
const Dialog: React.FC<IDialogProps> = ({ className, isOpen, title, onAfterOpen, onAfterClose, contentOptions, onRequestClose, closeFromOutside = true, children, invisibleScroll = false }) => (
  <RawModal
    className={`${className === null ? '' : `${className} `}dialog-modal`}
    isOpen={isOpen}
    onAfterOpen={onAfterOpen}
    onAfterClose={onAfterClose}
    onRequestClose={onRequestClose}
    closeFromOutside={closeFromOutside}
    size="small"
  >
    <div className="dialog">
      <div className="dialog__content">
        <Header>
          <TitleWrapper>
            {typeof title === 'string' ? (
              <Text variant="h2" weight="medium" primary>
                {twemojify(title)}
              </Text>
            ) : (
              title
            )}
          </TitleWrapper>
          {contentOptions}
        </Header>
        <div className="dialog__content__wrapper">
          <ScrollView autoHide={!invisibleScroll} invisible={invisibleScroll}>
            <div className="dialog__content-container">{children}</div>
          </ScrollView>
        </div>
      </div>
    </div>
  </RawModal>
)

export default Dialog
