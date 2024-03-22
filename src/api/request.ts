import axios from 'axios'
import snackbarUtils from '../util/SnackbarUtils'

const request = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
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

export { request }
