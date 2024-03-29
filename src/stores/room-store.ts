import { action, flow, makeAutoObservable, observable } from 'mobx'
import { AxiosResponse } from 'axios'
import { Store } from './index'
import { OperationData } from '../app/components/message/FeedsNewsMessage'
import DefedApi, { IResponseType } from '../api/defed-api'
import { commonRequest, request } from '../api/request'
import { FeedsSingleNewsNecessaryData } from '../app/components/message/FeedsSingleNews'

export interface IAskFeedsNewsDraft {
  userId: string
  eventId: string
  newsData: FeedsSingleNewsNecessaryData
  round: number
  chatId: string
}

export interface TokenUserData {
  tokenId: string
  feedsNumPast24h: string
  isCollect: 'true' | 'false'
}

export interface TokenInfo {
  cmcRank: number
  id: string
  tokenId: string
  tokenLogo: string
  tokenName: string
  tokenSymbol: string
}
export default class RoomStore {
  rootStore: Store

  askFeedsNewsDrafts: Map<string, IAskFeedsNewsDraft | undefined> = new Map()

  feedNewsOperationData: Map<string, OperationData | undefined> = new Map()

  requestArticleIdList: Array<string> = []

  operationDataRequestTimer: ReturnType<typeof setTimeout> | null = null

  tokenDataWithUserAndFeeds: Map<string, TokenUserData | undefined> = new Map()

  requestTokenIdList: Array<string> = []

  tokenDataWithUserAndFeedsRequestTimer: ReturnType<typeof setTimeout> | null = null

  tokenInfoWithTokenName: Map<string, TokenInfo | undefined> = new Map()

  requestTokenNameList: Array<string> = []

  tokenInfoWithTokenNameRequestTimer: ReturnType<typeof setTimeout> | null = null

  constructor(roomStore: Store) {
    this.rootStore = roomStore
    makeAutoObservable(this, {
      rootStore: observable,
      resetStore: action,
      askFeedsNewsDrafts: observable,
      setAskFeedsNewsDraft: action,
      feedNewsOperationData: observable,
      updateFeedNewsOperationDataByArticleId: action,
      updateFeedNewsOperationDataByArticleIds: flow.bound,
      tokenDataWithUserAndFeeds: observable,
      updateTokenDataWithUserAndFeedsByTokenId: action,
      updateTokenDataWithUserAndFeedsByTokenIds: flow.bound,
      tokenInfoWithTokenName: observable,
      updateTokenInfoWithTokenName: flow.bound,
    })
  }

  resetStore = () => {
    this.askFeedsNewsDrafts = new Map()
    this.feedNewsOperationData = new Map()
    this.requestArticleIdList = []
    if (this.operationDataRequestTimer) {
      clearTimeout(this.operationDataRequestTimer)
    }
    this.operationDataRequestTimer = null
    this.tokenDataWithUserAndFeeds = new Map()
    this.requestTokenIdList = []
    if (this.tokenDataWithUserAndFeedsRequestTimer) {
      clearTimeout(this.tokenDataWithUserAndFeedsRequestTimer)
    }
    this.tokenDataWithUserAndFeedsRequestTimer = null
    this.tokenInfoWithTokenName = new Map()
    this.requestTokenNameList = []
    if (this.tokenInfoWithTokenNameRequestTimer) {
      clearTimeout(this.tokenInfoWithTokenNameRequestTimer)
    }
    this.tokenInfoWithTokenNameRequestTimer = null
  }

  setAskFeedsNewsDraft = (roomId: string, draft?: IAskFeedsNewsDraft) => {
    this.askFeedsNewsDrafts.set(roomId, draft)
  }

  updateFeedNewsOperationDataByArticleId = (articleId: string, operationData?: OperationData) => {
    this.feedNewsOperationData.set(articleId, operationData)
  };

  *updateFeedNewsOperationDataByArticleIds(articleIds: string | Array<string>) {
    if (Array.isArray(articleIds)) {
      articleIds.forEach((articleId) => {
        if (!this.requestArticleIdList.find((item) => item === articleId)) {
          this.requestArticleIdList.push(articleId)
        }
      })
    } else if (!this.requestArticleIdList.includes(articleIds)) {
      this.requestArticleIdList.push(articleIds)
    }
    if (this.operationDataRequestTimer) {
      clearTimeout(this.operationDataRequestTimer)
      this.operationDataRequestTimer = null
    }
    this.operationDataRequestTimer = setTimeout(async () => {
      if (!this.requestArticleIdList.length) return
      const result: AxiosResponse<IResponseType<Array<OperationData>>> = await request.get(DefedApi.getOperateList, {
        params: {
          articleIdList: this.requestArticleIdList.join(','),
        },
      })
      if (result?.data?.data?.length) {
        result.data.data.forEach((item) => {
          this.feedNewsOperationData.set(item.articleId, item)
        })
        this.requestArticleIdList = []
      }
    }, 500)
  }

  updateTokenDataWithUserAndFeedsByTokenId = (tokenId: string, tokenData?: TokenUserData) => {
    this.tokenDataWithUserAndFeeds.set(tokenId, tokenData)
  };

  *updateTokenDataWithUserAndFeedsByTokenIds(tokenIds: string | Array<string>) {
    if (Array.isArray(tokenIds)) {
      tokenIds.forEach((tokenId) => {
        if (!this.requestTokenIdList.find((item) => item === tokenId)) {
          this.requestTokenIdList.push(tokenId)
        }
      })
    } else if (!this.requestTokenIdList.find((item) => item === tokenIds)) {
      this.requestTokenIdList.push(tokenIds)
    }
    if (this.tokenDataWithUserAndFeedsRequestTimer) {
      clearTimeout(this.tokenDataWithUserAndFeedsRequestTimer)
      this.tokenDataWithUserAndFeedsRequestTimer = null
    }
    this.tokenDataWithUserAndFeedsRequestTimer = setTimeout(async () => {
      if (!this.requestTokenIdList.length) return
      const result: AxiosResponse<IResponseType<Array<TokenUserData>>> = await request.get(DefedApi.getCollectTokenList, {
        params: {
          tokenIdList: this.requestTokenIdList.join(','),
        },
      })
      if (result?.data?.data?.length) {
        result.data.data.forEach((item) => {
          this.tokenDataWithUserAndFeeds.set(item.tokenId, item)
        })
        this.requestTokenIdList = []
      }
    }, 500)
  }

  *updateTokenInfoWithTokenName(tokenNames: string | Array<string>) {
    if (Array.isArray(tokenNames)) {
      tokenNames.forEach((tokenName) => {
        if (!this.requestTokenNameList.includes(tokenName) && !this.tokenInfoWithTokenName.has(tokenName)) {
          this.requestTokenNameList.push(tokenName)
        }
      })
    } else if (!this.requestTokenNameList.includes(tokenNames) && !this.tokenInfoWithTokenName.has(tokenNames)) {
      this.requestTokenNameList.push(tokenNames)
    }
    if (this.tokenInfoWithTokenNameRequestTimer) {
      clearTimeout(this.tokenInfoWithTokenNameRequestTimer)
      this.tokenInfoWithTokenNameRequestTimer = null
    }
    this.tokenInfoWithTokenNameRequestTimer = setTimeout(async () => {
      if (this.requestTokenNameList.length) {
        const result: AxiosResponse<IResponseType<Array<TokenInfo>>> = await commonRequest.post(`https://v2.defed.finance/${DefedApi.postTokenInfoWithTokenName}`, {
          tokenIds: this.requestTokenNameList,
        })
        if (result?.data?.data?.length) {
          result.data.data.forEach((item) => {
            this.tokenInfoWithTokenName.set(item.tokenId, item)
          })
          this.requestTokenNameList = []
        }
      }
    }, 500)
  }
}
