import React, { useState, useEffect, useRef } from 'react'
import './Client.scss'

import { observer } from 'mobx-react-lite'
import { useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { initHotkeys } from '../../../client/event/hotkeys'
import { initRoomListListener } from '../../../client/event/roomList'
import Navigation from '../../organisms/navigation/Navigation'
import ReusableContextMenu from '../../atoms/context-menu/ReusableContextMenu'
import Windows from '../../organisms/pw/Windows'
import Dialogs from '../../organisms/pw/Dialogs'

import initMatrix from '../../../client/initMatrix'
import navigation from '../../../client/state/navigation'
import cons from '../../../client/state/cons'

import { MatrixClientProvider } from '../../hooks/useMatrixClient'
import { ClientContent } from './ClientContent'
import { useSetting } from '../../state/hooks/settings'
import { settingsAtom } from '../../state/settings'
import { useMobxStore } from '../../../stores/StoreProvider'
import ClientLoading from './ClientLoading'
import IframeApp from '../../components/IframeApp'

function SystemEmojiFeature() {
  const [systemEmoji] = useSetting(settingsAtom, 'useSystemEmoji')

  if (systemEmoji) {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji_DISABLED')
  } else {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji')
  }

  return null
}

function Client() {
  const {
    initData,
    changeTargetProxy,
    appStore: { isAppLoading, changeIsAppLoading, connectError },
    modalStore: { iframeAppData, iframeAppDisplay },
  } = useMobxStore()
  const [loadingMsg, setLoadingMsg] = useState('Heating up')
  const classNameHidden = 'client__item-hidden'
  const [searchParams, setSearchParams] = useSearchParams()
  const navWrapperRef = useRef(null)
  const roomWrapperRef = useRef(null)

  function onRoomSelected() {
    navWrapperRef.current?.classList.add(classNameHidden)
    roomWrapperRef.current?.classList.remove(classNameHidden)
  }
  function onNavigationSelected() {
    navWrapperRef.current?.classList.remove(classNameHidden)
    roomWrapperRef.current?.classList.add(classNameHidden)
  }

  useEffect(() => {
    navigation.on(cons.events.navigation.ROOM_SELECTED, onRoomSelected)
    navigation.on(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected)

    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SELECTED, onRoomSelected)
      navigation.removeListener(cons.events.navigation.NAVIGATION_OPENED, onNavigationSelected)
    }
  }, [])

  useEffect(() => {
    changeIsAppLoading(true)
    let counter = 0
    const iId = setInterval(() => {
      const msgList = ['Almost there...', 'Looks like you have a lot of stuff to heat up!']
      if (counter === msgList.length - 1) {
        setLoadingMsg(msgList[msgList.length - 1])
        clearInterval(iId)
        return
      }
      setLoadingMsg(msgList[counter])
      counter += 1
    }, 15000)
    initMatrix.once('init_loading_finished', () => {
      clearInterval(iId)
      initHotkeys()
      initRoomListListener(initMatrix.roomList)
      const targetProxy = searchParams.get('proxy')
      changeTargetProxy(targetProxy)
      initData(targetProxy)
      setSearchParams({})
    })
    initMatrix.init()
  }, [])

  if (connectError || isAppLoading) {
    return <ClientLoading loadingMsg={loadingMsg} />
  }

  return (
    <MatrixClientProvider value={initMatrix.matrixClient}>
      <div className="client-container">
        <Box
          className="navigation__wrapper"
          ref={navWrapperRef}
          sx={{
            width: iframeAppData && iframeAppDisplay ? 'auto' : 'var(--navigation-width)',
          }}
        >
          <Navigation />
        </Box>
        <Box
          className={`room__wrapper ${classNameHidden}`}
          sx={{
            position: iframeAppData ? 'relative' : 'static',
          }}
          ref={roomWrapperRef}
        >
          {iframeAppData ? <IframeApp /> : null}
          <ClientContent />
        </Box>
        <Windows />
        <Dialogs />
        <ReusableContextMenu />
        <SystemEmojiFeature />
      </div>
    </MatrixClientProvider>
  )
}

export default observer(Client)
