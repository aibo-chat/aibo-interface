import React, { createContext, PropsWithChildren, useContext } from 'react'
import { Store } from './index'

let store: Store
export const StoreContext = createContext<undefined | Store>(undefined)

export function useMobxStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within StoreProvider')
  }

  return context
}

export function initializeStore(initialData = null): Store {
  const _store = store ?? new Store()

  // If your page has Next.js data fetching methods that use a Mobx store, it will
  // get hydrated here, check `pages/ssg.js` and `pages/ssr.js` for more details
  if (initialData) {
    _store.appStore.hydrate(initialData)
  }
  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

export const StoreProvider: React.FC<PropsWithChildren<{ initialState: any }>> = ({ children, initialState: initialData }) => {
  const store = initializeStore(initialData)

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
