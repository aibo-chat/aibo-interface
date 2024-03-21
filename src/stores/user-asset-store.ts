import { action, makeObservable, observable, flow } from 'mobx'
import { AxiosResponse } from 'axios'
import { Store } from './index'
import { request } from '../api/request'
import DefedApi, { IGetUserHoldingResponse, IResponseType, IUserTokenResponse } from '../api/defed-api'
import { normalize } from '../app/utils/math-utils-v2'

export const getNetworkConfig = (chainId: number) => {
  switch (chainId) {
    case 1:
      return 'Ethereum'
    case 5:
      return 'Ethereum'
    case 137:
      return 'Polygon'
    case 80001:
      return 'Polygon'
    default:
      return 'Ethereum'
  }
}
export interface UserToken extends IUserTokenResponse {
  chainId: number
  chainName: string
  amountDecimal: string // 对应savingBalance
  dtokenBalanceDecimal: string
}
export interface AssetList {
  usdValue: string
  ethUsdPrice: string
  usdtUsdPrice: string
  wbtcUsdPrice: string
  userTokenList: UserToken[]
}
export default class UserAssetStore {
  rootStore: Store

  userAsset: AssetList | null = null

  loopTimer: ReturnType<typeof setTimeout> | null = null

  constructor(rootStore: Store) {
    this.rootStore = rootStore
    makeObservable(this, {
      resetStore: action,
      userAsset: observable,
      initData: flow.bound,
      getUserAsset: flow.bound,
    })
  }

  resetStore = () => {
    this.userAsset = null
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
    }
    this.loopTimer = null
  };

  *getUserAsset() {
    try {
      const result: AxiosResponse<IResponseType<IGetUserHoldingResponse>> = yield request.get(DefedApi.getUserHolding)
      if (!result?.data?.data?.userTokenInfoDTOList) return
      const userTokenList = result.data.data.userTokenInfoDTOList.map((item: any) => ({
        ...item,
        chainId: Number(item.chainId),
        chainName: getNetworkConfig(Number(item.chainId)),
        amountDecimal: normalize(item.amount, item.tokenDecimal),
        dtokenBalanceDecimal: normalize(item.dtokenBalance, item.tokenDecimal),
      }))
      this.userAsset = {
        usdValue: result.data.data.usdValue,
        ethUsdPrice: result.data.data.ethUsdPrice,
        usdtUsdPrice: result.data.data.usdtUsdPrice,
        wbtcUsdPrice: result.data.data.wbtcUsdPrice,
        userTokenList,
      }
    } catch (e) {
      console.error(e)
    }
  }

  *initData() {
    yield this.getUserAsset()
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
    }
    this.loopTimer = setTimeout(() => {
      this.getUserAsset()
    }, 15000)
  }
}
