export enum DefedMsgType {
  Transfer = 'd.transfer',
  CryptoBox = 'd.crypto_box',
  QuestionTemplate = 'd.question_template',
  News = 'd.news',
  TokenData = 'd.metrics',
  Posts = 'd.posts',
  FearGreedIndex = 'd.index',
  Digest = 'd.digest',
  ETF = 'd.etf',
  CommonTransfer = 'd.common_transfer',
  ConvertCard = 'd.convert',
}
export enum DefedEventType {
  RoomConditions = 'm.room.condition',
}

export interface BotAnswerMessageContent {
  action?: string
  answer: string
  answerType: string
  canSave: boolean
  chatAnswer: string
  chatId: string
  client: string
  links: Array<string>
  longModel: boolean
  question: string
  round: number
  userId: string
}
export interface ITokenInfo {
  sourceCode: string[]
  technicalDoc: string[]
  website: string[]
  id: string
  price: string
  tokenId: string
  tokenSymbol: string
  tokenName: string
  tokenLogo: string
  priceChangePercentage24h: string
  supported: boolean
  isCollected: string

  circulatingSupply: string
  maxSupply: string | null
  totalSupply: string
  volSpot24h: string
  marketCap: string
  low24h: string
  high24h: string
}

interface IContentToken {
  content: {
    id: number
    slug: string
    symbol: string
    name?: string
  }
  type: 'token'
}

interface IContentHashtag {
  type: 'hashtag'
  content: {
    tag: string
  }
}

interface IContentLink {
  type: 'link'
  content: {
    display?: string
    url: string
  }
}

interface IContentText {
  type: 'text'
  content: string
}

interface IContentMention {
  type: 'mention'
  content: {
    guid: string
    handle: string
  }
}

type TContentItem = IContentText | IContentLink | IContentHashtag | IContentToken | IContentMention

export type TContentData = TContentItem[][]
