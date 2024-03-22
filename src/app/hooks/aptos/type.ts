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