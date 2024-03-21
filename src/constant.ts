export const L2_WEB3_URL = import.meta.env.VITE_PUBLIC_DATA_PROVIDER as string
export const L2_NETWORK_FEE_CONTROLLER = import.meta.env.VITE_PUBLIC_L2_NETWORK_FEE_CONTROLLER as string
export const L2_TOKEN_CONTROLLER_V2_ADDRESS = import.meta.env.VITE_PUBLIC_L2_TOKEN_CONTROLLER_V2_ADDRESS as string
export const PUBLIC_PROXY_ADMIN = import.meta.env.VITE_PUBLIC_PROXY_ADMIN as string
export const isProduction = import.meta.env.VITE_PUBLIC_ENVIRONMENT === 'production'
export const DefedFinanceUrl = import.meta.env.VITE_DEFED_FINANCE_URL
export const MatrixHomeServer = import.meta.env.VITE_MATRIX_HOME_SERVER
export const CommonScrollBarCSS = {
  '&::-webkit-scrollbar': {
    width: '6px',
    borderRadius: '4px',
    backgroundColor: '#FAFAFA',
  },
  '&::-webkit-scrollbar-thumb': {
    width: '6px',
    borderRadius: '4px',
    backgroundColor: '#AAB4BE',
  },
}
export const DefedNetworkConfigs: Record<string, any> = {
  '1': {
    chainName: 'Ethereum',
    explorerLink: 'https://etherscan.io/',
  },
  '5': {
    chainName: 'Ethereum',
    explorerLink: 'https://goerli.etherscan.io/',
  },
  '137': {
    chainName: 'Polygon',
    explorerLink: 'https://polygonscan.com/',
  },
  '80001': {
    chainName: 'Polygon',
    explorerLink: 'https://mumbai.polygonscan.com/',
  },
}
