import React, { useEffect, useState } from 'react'
import type { Connector } from '@web3-react/types'
import { MetaMask } from '@web3-react/metamask'
import { Web3ReactHooks } from '@web3-react/core'
import type { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import { hooks, metaMask } from './metaMask'
import { ConnectWithSelect } from './ConnectWithSelect'
import { CHAINS } from './chains'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
const getName = (connector: Connector) => {
  if (connector instanceof MetaMask) return 'MetaMask'
  return 'Unknown'
}
const useBalances = (provider?: ReturnType<Web3ReactHooks['useProvider']>, accounts?: string[]): BigNumber[] | undefined => {
  const [balances, setBalances] = useState<BigNumber[] | undefined>()

  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      void Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
        if (stale) return
        setBalances(balances)
      })

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [provider, accounts])

  return balances
}
const MetaMaskCard = () => {
  const chainId = useChainId()
  const name = chainId ? CHAINS[chainId]?.name : undefined
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState<{ name: string; message: string } | undefined>(undefined)
  const balances = useBalances(provider, accounts)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  }, [])

  return (
    <div
      style={{
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
        margin: '1rem',
        overflow: 'auto',
        border: '1px solid',
        borderRadius: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <b>{getName(metaMask)}</b>
      <div style={{ marginBottom: '1rem' }}>
        <div>
          {error ? (
            <>
              🔴 {error.name ?? 'Error'}
              {error.message ? `: ${error.message}` : null}
            </>
          ) : isActivating ? (
            <>🟡 Connecting</>
          ) : isActive ? (
            <>🟢 Connected</>
          ) : (
            <>⚪️ Disconnected</>
          )}
        </div>
      </div>
      {chainId ? (
        name ? (
          <div>
            Chain:{' '}
            <b>
              {name} ({chainId})
            </b>
          </div>
        ) : (
          <div>
            Chain Id: <b>{chainId}</b>
          </div>
        )
      ) : null}
      <div style={{ marginBottom: '1rem' }}>
        {accounts?.length ? (
          <div>
            Accounts:{' '}
            <b>
              {accounts.length === 0
                ? 'None'
                : accounts?.map((account: React.Key | null | undefined, i: string | number) => (
                    <ul key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ENSNames?.[i] ?? account}
                      {balances?.[i] ? ` (Ξ${formatEther(balances[i])})` : null}
                    </ul>
                  ))}
            </b>
          </div>
        ) : null}
      </div>
      <ConnectWithSelect connector={metaMask} activeChainId={chainId} chainIds={undefined} isActivating={isActivating} isActive={isActive} error={error} setError={setError} />
    </div>
  )
}

export default MetaMaskCard
