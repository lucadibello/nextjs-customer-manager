import Cookie from 'cookie-universal'
import { RefreshApiResponse } from '../pages/login/login'

import { ApiResponse } from '../lib/types/api'

/**
 * Fetcher is a wrapper around fetch that adds the necessary headers and handles token refresh
 * @param url The url to fetch
 * @param isRetrying Whether this is a retry after a token refresh
 * @returns The response from the fetch
 */
const fetcher = <T extends ApiResponse<T>>(
  url: string,
  data: object | null = null,
  isRetrying = false
): Promise<T> => {
  // Check if we are sending data
  return fetch(url, {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then(async res => {
    // Check if response is ok
    if (res.status == 498) {
      // If not, check if we are already retrying
      if (isRetrying) {
        throw new Error('Unable to refresh token')
      }

      // Access refresh token via local storage
      const refreshToken = localStorage.getItem('refreshToken')

      // Token expired, refresh it and retry the request using recursion
      if (refreshToken) {
        return fetch('/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })
          .then(refreshRes => refreshRes.json() as Promise<RefreshApiResponse>)
          .then(refreshRes => {
            if (refreshRes.success && refreshRes.data) {
              // Update the new access token in cookies
              const cookie = Cookie()
              cookie.set('token', refreshRes.data.token)

              // Retry the request
              return fetcher<T>(url, data, true)
            } else {
              throw new Error('Unable to refresh token')
            }
          })
      } else {
        throw new Error('Missing refresh token. Please login again.')
      }
    } else {
      const responseJson: T = await res.json()
      if (!responseJson.success) {
        throw new Error(responseJson.message)
      }
      return responseJson
    }
  })
}

export default fetcher
