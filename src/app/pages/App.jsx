import React, { StrictMode } from 'react'
import { Provider } from 'jotai'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { StoreProvider } from '../../stores/StoreProvider'
import MainPage from './MainPage'
import NotFoundErrorPage from './NotFoundErrorPage'
import { SnackbarUtilsConfigurator } from '../../util/SnackbarUtils'
import { AppGlobalStyles } from '../components/theme/AppGlobalStyles'
import CheckCircle from '../../../public/res/svg/toast/check-circle.svg?react'
import Error from '../../../public/res/svg/toast/error.svg?react'
import InfoTip from '../../../public/res/svg/toast/info.svg?react'

import { WalletContextProvider } from '../components/aptos/WalletContext'
import { TestPage } from './Test'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainPage />,
      errorElement: <NotFoundErrorPage />,
    },
    {
      path: '/test',
      element: <TestPage />,
      errorElement: <NotFoundErrorPage />,
    },
  ],
  {},
)

function App() {
  return (
    <StrictMode>
      <StoreProvider initialState={null}>
        <AppGlobalStyles>
          <SnackbarProvider
            maxSnack={5}
            autoHideDuration={2000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            iconVariant={{
              success: <CheckCircle />,
              error: <Error />,
              info: <InfoTip />,
            }}
          >
            <SnackbarUtilsConfigurator />
            <Provider>
              <WalletContextProvider>
                <RouterProvider router={router} />
              </WalletContextProvider>
            </Provider>
          </SnackbarProvider>
        </AppGlobalStyles>
      </StoreProvider>
    </StrictMode>
  )
}

export default App
