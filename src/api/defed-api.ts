import { TransferStatus } from '../app/components/message/TransferMessage'

export interface IResponseType<T = any> {
  code: number
  data: T
  msg: null | string
}
export interface IUserTokenResponse {
  amount: string
  changePrice24h: string
  dtokenBalance: string
  price: string // 对应priceInUsd
  tokenAddress: string // 对应token
  tokenDecimal: string
  tokenName: string // 对应原来的name
  vtokenAddress: string // 对应vtoken
  tokenSymbol: string // 对应symbol
  creditBalance: string // 对应availableBorrows
  depositNum: number // 入金记录数
  chainId: string
  cmcTokenId: null | string
}
export interface IGetUserHoldingResponse {
  usdValue: string // 系统中总余额（美元）
  ethUsdPrice: string
  usdtUsdPrice: string
  wbtcUsdPrice: string
  userTokenInfoDTOList: IUserTokenResponse[]
}
export interface IGetTransferInMessageResultResponse {
  symbol: string
  decimals: number
  realAmount: number
  amount: number
  asset: string
  bizTxId: number
  chainId: number
  confirmation: number
  createDate: number
  deadline: number
  id: number
  interestRateMode: number
  nonce: number
  operation: number
  signature: string
  to: string
  toAddress: string
  transferType: string
  txHash: string
  updateDate: number
  value: number
  status: TransferStatus
}
export interface IPermissionResult {
  defedBalanceLimit: number
  hasBeenSent: boolean
  receiverClaimed: boolean
  senderClaimed: boolean
  toDaySendNum: number
  totalSendNum: number
}

export interface IClaimRedEnvelopeRecordResponse {
  sender: string
  receiver: string
  receiverLevel: string
  txHash: string
  wethamount: number
  polyDEFEAmount: number
  messageId: number
  code?: number
  msg?: string
}

export interface IGetTokenInfoResponse {
  decimals: number
  symbol: string
  logo: string
}

export interface IConversationData {
  avatarLink: null | string
  createDate: number
  createTime: number
  email: null | string
  ens: null | string
  findId: string
  groupInfo: null | string
  groupKeys: null | string
  handleName: null | string
  id: number
  lastMsg: string
  loginEmail: null | string
  mute: false
  name: string
  ownerAddress: null | string
  publicKey: string
  readTime: number
  remove: false
  role: string
  signature: string
  toProxy: string
  toUserId: null | string
  top: true
  topic: string
  type: string
  unreadCount: number
  updateDate: number
  updateTime: number
  userId: number
  userMessageKey: null | string
}
export interface IGetConversationList {
  cons: Array<IConversationData>
}

export interface IListMyCreateGroupResponseData {
  id: number
  topic: string
  type: string
  name: string
  publicity: null
  description: string
  avatar: string
  avatarCompress: string
  createDate: number
  updateDate: number
  memberCount: number
  applyJoinInGroupStatus: null
  inviteJoinInGroupStatus: null
  isJoinInGroup: null
  groupConditionList: Array<{
    id: number
    topic: string
    network: string
    networkLogo: string
    type: string
    symbol: string
    tokenLogo: string
    tokenLink: string
    address: string
    decimals: string
    amount: string
    createDate: number
    updateDate: number
  }>
  conversationList: Array<IConversationData>
}
enum DefedApi { // 用户登录后获取自己的信息
  getAccountData = 'defed/user/account/me',
  getUserInfo = 'defed/msg/user/getMsgAnyUserInfo',
  getUserHolding = 'defed/user/data/getUserHolding',
  // 用户聊天内转账
  postTransferMsg = 'defed/v2/proxy/transferMsg',
  // 用户聊天内信用转账
  postTransferCreditMsg = 'defed/v2/proxy/transferCreditMsg',
  // 用户内部转账 saving
  postInnerTransfer = 'defed/lending/transferInner',
  // 用户内部转账 credit
  postInnerTransferCredit = 'defed/lending/transferCreditInner',
  getTransferInMessageResult = 'defed/v2/proxy/getTransferInMessageResult',
  postReceiveTransferMsg = 'defed/v2/proxy/receiveTransferMsg',
  postRejectTransferMsg = 'defed/v2/proxy/rejectTransferMsg',
  postCancelTransferMsg = 'defed/v2/proxy/cancelTransferMsg',
  getPermissionForRedEnvelope = 'defed/v1_5/redEnvelope/getPermission',
  postSaveSendRecordForRedEnvelope = 'defed/v1_5/redEnvelope/saveSendRecord',
  postOpenClaimRedEnvelope = 'defed/v1_5/redEnvelope/claimRedEnvelope',
  getGroupConfig = 'defed/msg/group/getGroupConfigInfo',
  getTokenInfo = 'defed/msg/group/getTokenInfo',
  addGroupConfigInfo = 'defed/msg/group/addGroupConfigInfo',
  uploadImage = 'defed/ipfs/uploadImage',
  postTranslate = 'defed/uaa/feeds/public/translate',
  getOperateList = 'defed/uaa/feeds/private/getOperateList',
  uploadFile = 'defed/file/uploadFile',
  postOperateArticle = 'defed/uaa/feeds/private/operate',
  getCollectTokenList = 'defed/uaa/tokenPage/private/getCollectTokenList',
  collectToken = 'defed/uaa/tokenPage/private/collectToken',
  getConversationList = 'defed/msg/conversation/list',
  // 获取用户在旧的聊天中创建的群组
  listMyCreateGroup = 'defed/msg/group/listMyCreateGroup',
  postTokenInfoWithTokenName = 'defed/news/token/tokenInfo',
  transferSearch = 'defed/v2/proxy/transferSearch',
  // 获取最近的转账记录
  getRecentTransfer = 'defed/v2/proxy/getRecentTransfer',
  getPageTransaction = 'defed/uaa/transaction/getPageTransaction',
}

export default DefedApi
