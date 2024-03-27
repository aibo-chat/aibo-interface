export interface AptosUserAssetData {
  amount: number
  asset_type: string
  metadata: {
    asset_type: string
    decimals: number
    name: string
    symbol: string
  }
}

export const BASE_COIN_DATA = {
  amount: 0,
  asset_type: '0x1::aptos_coin::AptosCoin',
  metadata: {
    asset_type: '0x1::aptos_coin::AptosCoin',
    decimals: 8,
    name: 'Aptos Coin',
    symbol: 'APT',
  }
}