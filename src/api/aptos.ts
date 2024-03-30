import axios from 'axios'
import snackbarUtils from '../util/SnackbarUtils'
import { IEstimateParams } from '../app/hooks/aptos/useConvert'

const request = axios.create({
  baseURL: 'http://8.219.165.132:1107',
  // baseURL: 'https://aggregator.aibo.chat',
  timeout: 60000,
})

request.interceptors.request.use((config) => config)

request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error?.message && typeof error.message === 'string') {
      snackbarUtils.error(error.message)
    }
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

enum AptosApi {
  GET_ROUTER = '/router',
}

export const getRouter = (data: IEstimateParams) => request.get(AptosApi.GET_ROUTER, {
  params: data
})