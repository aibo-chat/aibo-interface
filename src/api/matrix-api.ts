export interface IPostSaveMatrixSecurityKeyParams {
  securityKey: string
  forceSave: boolean
}
export interface IGetMatrixSecurityKeyResponse {
  createDate: number
  id: number
  proxy: string
  securityKey: string
  updateDate: number
}
export type IGetMatrixRoomKeyResponse = Array<{
  createDate: number
  id: number
  proxy: string
  roomId: string
  roomKeyId: string
  roomKeyText: string
  updateDate: number
}>

export type IGetBotListSingleBotType = {
  avatar_url: string
  create_date: string
  display_name: string
  id: number
  introduction: string
  localpart: string
  reply_rate: number
  reply_room_types: string
  status: -1 | 0 | 1 // 未注册 | 禁用 | 正常使用
  type: string
  update_date: string
  update_profile: number
  user_id: string
  question_template?: string
}
export type IGetBotListResponse = Array<IGetBotListSingleBotType>
enum MatrixApi {
  // 获取用户加密后的securityKey
  getMatrixSecurityKey = 'defed/matrix/getMatrixSecurityKey',
  // 保存用户加密后的securityKey
  saveMatrixSecurityKey = 'defed/matrix/saveMatrixSecurityKey',
  // 保存用户加密后的RoomKey
  saveMatrixRoomKey = 'defed/matrix/saveMatrixRoomKey',
  // 获取用户加密后的RoomKey
  listMatrixRoomKey = 'defed/matrix/listMatrixRoomKey',
  // 获取AiBot列表
  listMatrixBot = 'aibo/matrix/bot/list',
}

export default MatrixApi
