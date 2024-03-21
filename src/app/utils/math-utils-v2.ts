import { BigNumber } from 'bignumber.js'
import { UserToken } from '../../stores/user-asset-store'

type BigNumberValue = string | number | BigNumber

export function convertOutInputDecimal(value: string) {
  if (!value) return ''
  if (Number(value) < 0.0001 && Number(value) > 0) {
    return '<0.0001'
  }
  // 4 is base input decimal 保留小数点四位 + 去尾
  return valueToBigNumber(value).toFixed(4, BigNumber.ROUND_DOWN)
}

export function convertDecimal(value: string) {
  if (!value) return ''
  if (Number(value) < 0.0001 && Number(value) > 0) {
    return '<0.0001'
  }
  if (Number(value) < 0) {
    return '<0'
  }
  // 4 is base input decimal 保留小数点四位 + 去尾
  return valueToBigNumber(value).toFixed(4, BigNumber.ROUND_DOWN)
}

export function convetToInputDecimal(value: string) {
  // 4 is base input decimal 保留小数点四位 + 去尾
  return valueToBigNumber(value).toFixed(4, BigNumber.ROUND_DOWN)
}

// ROUND_FLOOR Rounds towards -Infinity
export function computedFloorNumber(num: number, decimals: number) {
  return valueToBigNumber(num).toFixed(decimals, BigNumber.ROUND_FLOOR)
}

export function computedDEFEUsd(amount: string, value: string) {
  return valueToBigNumber(amount).times(value).toString()
}

export function convertTokenToUSD(DEFEPrice: string, ETHPrice: string) {
  return valueToBigNumber(DEFEPrice).times(ETHPrice).shiftedBy(-18).toString()
}

export function convertDEXTokenToUSD(priceInEth: string, ETHPrice: string, symbol: string) {
  if (symbol === 'USDT') return '100000000'
  return valueToBigNumber(priceInEth).times(ETHPrice).shiftedBy(-18).toString()
}

export function computedYearProfitToken(a: string, b: string) {
  const _a = a || 0
  return new BigNumber(_a).times(b).toString()
}

export function valueToBigNumber(amount: BigNumberValue) {
  if (amount instanceof BigNumber) {
    return amount
  }
  return new BigNumber(amount)
}

export function computedBN(a: BigNumberValue, b: BigNumberValue) {
  return valueToBigNumber(a).dividedBy(b).toString(10)
}

export function normalizeBN(n: BigNumberValue, decimals: number) {
  return valueToBigNumber(n).shiftedBy(decimals * -1)
}

export function normalize(n: BigNumberValue, decimals: number) {
  return normalizeBN(n, decimals).toString(10)
}

// 去精度，且保留四位小数，向下取整
export function normalizeFloor(n: BigNumberValue, decimals: number) {
  return normalizeBN(n, decimals).toFixed(4, BigNumber.ROUND_DOWN)
}

export function parseGwei(value: string) {
  return new BigNumber(value).div(1e9).toFixed(0)
}

export function fromTokenAmount(amount: BigNumber | number | string, decimals: string): BigNumber {
  return new BigNumber(amount).times(new BigNumber(10).exponentiatedBy(decimals))
}
export function AmountToNative(amount: BigNumber | number | string, decimals: number): BigNumber {
  return new BigNumber(amount).dividedBy(new BigNumber(10).exponentiatedBy(decimals))
}
export const BigNumberZeroDecimal = BigNumber.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
})

export function valueToZDBigNumber(amount: BigNumberValue) {
  return new BigNumberZeroDecimal(amount)
}
export const SECONDS_PER_YEAR = valueToBigNumber('31536000')

export const WAD = valueToZDBigNumber(10).pow(18)

export const HALF_WAD = WAD.dividedBy(2)

export const RAY = valueToZDBigNumber(10).pow(27)

export const HALF_RAY = RAY.dividedBy(2)

export const WAD_RAY_RATIO = valueToZDBigNumber(10).pow(9)

export const RAY_DECIMALS = 27

export function rayMul(a: BigNumberValue, b: BigNumberValue) {
  return HALF_RAY.plus(valueToZDBigNumber(a).multipliedBy(b)).div(RAY)
}

export function rayPow(a: BigNumberValue, p: BigNumberValue) {
  let x = valueToZDBigNumber(a)
  let n = valueToZDBigNumber(p)
  let z = n.modulo(2).eq(0) ? valueToZDBigNumber(RAY) : x
  for (n = n.div(2); !n.eq(0); n = n.div(2)) {
    x = rayMul(x, x)
    if (!n.modulo(2).eq(0)) {
      z = rayMul(z, x)
    }
  }
  return z
}

export function getComputedReserveFields(reserve: any) {
  const supplyAPY = rayPow(valueToZDBigNumber(reserve.liquidityRate).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(RAY)
  const variableBorrowAPY = rayPow(valueToZDBigNumber(reserve.variableBorrowRate).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(RAY)
  return {
    supplyAPY: normalize(supplyAPY, RAY_DECIMALS),
    variableBorrowAPY: normalize(variableBorrowAPY.negated(), RAY_DECIMALS),
  }
}

export function USDToNative(amount: string, priceInUsd: string) {
  if (Number(amount) === 0) return '0'
  return valueToBigNumber(amount).times(1e8).dividedBy(priceInUsd).toString()
}

export function USDToNativeWithoutDecimal(amount: string, priceInUsd: string) {
  if (Number(amount) === 0) return '0'
  return valueToBigNumber(amount).dividedBy(priceInUsd).toString()
}
export function nativeToUSD(amount: string, priceInUsd: string) {
  return valueToBigNumber(amount).times(priceInUsd).dividedBy(1e8).toString()
}
export function nativeToUSDWithoutDecimal(amount: string, priceInUsd: string) {
  return valueToBigNumber(amount).times(priceInUsd).toString()
}

export function amountToUSD(amount: string | number, priceInUsd: string) {
  return valueToBigNumber(amount).times(priceInUsd).toString()
}

function computedAvailableBorrows(availableBorrowsETH: string, ethToUsd: string, priceInUsd: string) {
  return valueToBigNumber(availableBorrowsETH).shiftedBy(-18).times(ethToUsd).dividedBy(priceInUsd).toString(10)
}

export function getShrinkAvailableBorrowsETH(rawAvailableBorrowsETH: string) {
  return valueToBigNumber(rawAvailableBorrowsETH).times(0.99).toFixed(0, 1)
}

// Available ETH 转换为 USD
export function computedETHToUSD(availableBorrowsETH: string, ethToUsd: string) {
  return valueToBigNumber(availableBorrowsETH).shiftedBy(-18).times(ethToUsd).dividedBy(1e8).toString(10)
}

export function formatMarketsReserves(asset: any, decimals: number, priceInUsd: string) {
  if (!asset) {
    return {
      totalLiquidity: '0',
      totalCurrentVariableDebt: '0',
      totalLiquidityUSD: '0',
      totalCurrentVariableDebtUSD: '0',
    }
  }
  const totalLiquidity = normalize(asset.totalLiquidity, decimals)
  const totalCurrentVariableDebt = normalize(asset.totalCurrentVariableDebt as string, decimals)
  const totalLiquidityUSD = nativeToUSD(totalLiquidity, priceInUsd)
  const totalCurrentVariableDebtUSD = nativeToUSD(totalCurrentVariableDebt, priceInUsd)
  return {
    totalLiquidity,
    totalCurrentVariableDebt,
    totalLiquidityUSD,
    totalCurrentVariableDebtUSD,
  }
}
export interface UserReserveData {
  savingBalance: string // 存款
  variableBorrows: string // 负债
}
export interface UserData {
  availableBorrowsETH: string
  currentLiquidationThreshold: string
  currentLTV: string
  healthFactor: string
  totalCollateralETH: string
  totalDebtETH: string
  reserves: UserReserveData[]
}

// function computedPortfolioValue(totalCollateralETH: string, ethToUsd: string) {
//   return valueToBigNumber(totalCollateralETH).times(ethToUsd).shiftedBy(-18).shiftedBy(-8).toString()
// }

function normalizeHealthFactor(heal: string, debt: string) {
  if (heal === 'max') return '∞'
  if (debt === '0') return '∞'
  return normalizeBN(heal, 18).toFixed(2, 1)
}

export function calculateHealthFactor({ totalCollateralETH, totalDebtETH, liquidationThreshold }: { totalCollateralETH: string; totalDebtETH: string; liquidationThreshold: string }) {
  if (valueToBigNumber(totalDebtETH).lte(0)) return '∞'
  const X = valueToBigNumber(valueToBigNumber(totalCollateralETH).multipliedBy(liquidationThreshold).plus(5000)).dividedBy(10000)
  const healthFactor = X.shiftedBy(18).plus(valueToBigNumber(totalDebtETH).dividedBy(2)).dividedBy(totalDebtETH)
  return normalizeBN(healthFactor, 18).toFixed(2)
}
export interface ITokenReserve {
  reserve: UserToken | undefined
  amount: string
  placeAmount: string // 实际挂单接口传入的数量
  atoken: string
}
export function getConvertCollateralInETH({ fromToken, toToken, ethToUsd, totalCollateralETH }: { ethToUsd: string; totalCollateralETH: string; fromToken: ITokenReserve; toToken: ITokenReserve }) {
  if (!fromToken.reserve || !toToken.reserve || !fromToken.amount || !toToken.amount) return '0'

  // 将 token 换算为 ETH价值，不是Ethereum网络抵押价值为0
  const fromCollateralETH = fromToken.reserve.chainName === 'Ethereum' ? valueToBigNumber(fromToken.amount).shiftedBy(18).multipliedBy(fromToken.reserve.price).dividedBy(ethToUsd) : '0'

  const toCollateralETH = toToken.reserve.chainName === 'Ethereum' ? valueToBigNumber(toToken.amount).shiftedBy(18).multipliedBy(toToken.reserve.price).dividedBy(ethToUsd) : '0'

  return valueToBigNumber(totalCollateralETH).minus(fromCollateralETH).plus(toCollateralETH).toString()
}

export function getNewCollateralInETH({ amount, currencyInUSD, ethToUsd, totalCollateralETH }: { amount: string; currencyInUSD: string; ethToUsd: string; totalCollateralETH: string }) {
  if (!amount) return '0'

  const inputCollateralETH = valueToBigNumber(amount).shiftedBy(18).multipliedBy(currencyInUSD).dividedBy(ethToUsd)

  return valueToBigNumber(totalCollateralETH).minus(inputCollateralETH).toString()
}

export function getNewDebtInETH({ amount, currencyInUSD, ethToUsd, totalDebtETH, isBorrow }: { amount: string; currencyInUSD: string; ethToUsd: string; totalDebtETH: string; isBorrow?: boolean }) {
  if (!amount) return '0'

  const inputDebtETH = valueToBigNumber(amount).shiftedBy(18).multipliedBy(currencyInUSD).dividedBy(ethToUsd)

  if (isBorrow) return valueToBigNumber(totalDebtETH).plus(inputDebtETH).toString()

  return valueToBigNumber(totalDebtETH).minus(inputDebtETH).toString()
}

export function formatDefeAPYData(arr: string[], filterReserves: any, defePrice: string) {
  const symbols = ['ETH', 'WBTC', 'USDC', 'USDT']

  const temp: any = symbols.map((symbol, index) => ({
    symbol,
    perSupplyDefe: arr[index],
    perBorrowDefe: arr[index + 4],
  }))

  return temp.map((t: any) => {
    const computedToken = filterReserves.find((f: any) => f.symbol === t.symbol)

    const {
      totalCurrentVariableDebt,
      totalATokenSupply,
      decimals,
      price: { priceInEth, oracle },
    } = computedToken

    const supplyAPR =
      totalATokenSupply !== '0' ? valueToBigNumber(defePrice).times(t.perSupplyDefe).times(SECONDS_PER_YEAR).shiftedBy(decimals).dividedBy(totalATokenSupply).dividedBy(priceInEth) : '0'

    const borrowAPR =
      totalCurrentVariableDebt !== '0' ? valueToBigNumber(defePrice).times(t.perBorrowDefe).times(SECONDS_PER_YEAR).shiftedBy(decimals).dividedBy(totalCurrentVariableDebt).dividedBy(priceInEth) : '0'

    const supplyAPY = rayPow(valueToZDBigNumber(supplyAPR).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(RAY)

    const variableBorrowAPY = rayPow(valueToZDBigNumber(borrowAPR).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(RAY)

    const defeSupplyAPY = Number.isNaN(supplyAPY.toNumber()) ? '0' : normalize(supplyAPY, 18)
    const defeBorrowAPY = Number.isNaN(variableBorrowAPY.toNumber()) ? '0' : normalize(variableBorrowAPY, 18)
    const defePriceUSD = valueToBigNumber(defePrice).dividedBy(oracle.usdPriceEth).toString()

    return {
      ...t,
      ...computedToken,
      defePrice,
      defePriceUSD,
      defeSupplyAPY,
      defeBorrowAPY,
    }
  })
}

export interface HistoryList {
  id: string
  amount: string
  createTimestamp: string
  txHash: string
  asset: string
  typeFullName: string
  exchange: any
  toUserProxy: string | null
  aToken: string | null
  chainId: number | null
  transferDirection: string | null
  type: string
  isTransferIn: boolean
  decimals: any
  symbol: any
  name: any
  priceInUsd: any
  pDefeAmount: string
  rfqPlaceOrder: any
  rfqCloseOrder: any
}
