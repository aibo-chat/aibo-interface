export interface IPostSaveMatrixSecurityKeyParams {
  security_key: string
}
export interface IGetMatrixSecurityKeyResponse {
  id: number
  user_id: string
  security_key: string
  create_date: string
  update_date: string
}
export type IGetMatrixRoomKeyResponse = Array<{}>

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
  getMatrixSecurityKey = 'aibo/matrix/key/getSecurityKey',
  // 保存用户加密后的securityKey
  saveMatrixSecurityKey = 'aibo/matrix/key/saveSecurityKey',
  // 保存用户加密后的RoomKey
  saveMatrixRoomKey = 'aibo/matrix/key/saveSessionKey',
  // 获取用户加密后的RoomKey
  listMatrixRoomKey = 'aibo/matrix/key/listSessionKey',
  // 获取AiBot列表
  listMatrixBot = 'aibo/matrix/bot/list',
}

export default MatrixApi
