import client from './client'

export async function login(email, password) {
  const { data } = await client.post('/login', { email, password })
  localStorage.setItem('token', data.token)
  return data
}

export async function me() {
  const { data } = await client.get('/me')
  return data
}

export function logout() {
  localStorage.removeItem('token')
  return client.post('/logout').catch(() => {})
}
