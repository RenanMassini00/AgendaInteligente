import { getAuthToken, redirectToLogin, signOut } from './auth'
import type { ApiMessage } from '../types/api.types'

type RuntimeConfig = {
  VITE_API_URL?: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig
  }
}

function removeTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

const configuredApiUrl = window.__APP_CONFIG__?.VITE_API_URL ?? import.meta.env.VITE_API_URL
const API_BASE_URL =
  configuredApiUrl === undefined ? 'http://2.25.147.236:5000' : removeTrailingSlash(configuredApiUrl)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 401 && token) {
    signOut()
    redirectToLogin()
    throw new Error('Sua sessão expirou. Faça login novamente.')
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'

    try {
      const payload = (await response.json()) as ApiMessage
      if (payload?.message) {
        message = payload.message
      }
    } catch {
      message = `${message} (${response.status})`
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: 'DELETE',
    }),
}

export { API_BASE_URL }
