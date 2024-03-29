/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string
  readonly VITE_INFURA_KEY: string
  readonly VITE_ALCHEMY_KEY: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_MATRIX_HOME_SERVER: string
  readonly VITE_DEFED_FINANCE_URL: string
  readonly VITE_PUBLIC_DATA_PROVIDER: string
  readonly VITE_PUBLIC_L2_NETWORK_FEE_CONTROLLER: string
  readonly VITE_PUBLIC_L2_TOKEN_CONTROLLER_V2_ADDRESS: string
  readonly VITE_PUBLIC_GRAPH_BASE_URL: string
  readonly VITE_PUBLIC_DATA_PROVIDER_ADDRESS: string
  readonly VITE_PUBLIC_PROXY_ADMIN: string
  readonly VITE_PUBLIC_ENVIRONMENT: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  changeDeveloperMode: (newValue: boolean) => void
  petra?: Object
}
// declare module '*.svg' {
//   import * as React from 'react'
//
//   export const ReactComponent: React.FunctionComponent<React.ComponentProps<'svg'> & { title?: string }>
//   export default ReactComponent
// }
