import { useEffect } from 'react'
import { useMobxStore } from '../../stores/StoreProvider'
import { DEFAULT_USER_INFO } from '../../stores/user-info-store'

export function useUserInfoWithProxy(proxy: string) {
  const {
    userInfoStore: { updateUserInfoWithProxy, observableCount, getUserInfoWithProxy },
  } = useMobxStore()
  const userInfo = (() => (proxy ? getUserInfoWithProxy(proxy) : DEFAULT_USER_INFO))()
  useEffect(() => {
    if (proxy) {
      updateUserInfoWithProxy(proxy)
    }
  }, [proxy])
  return [userInfo]
}
