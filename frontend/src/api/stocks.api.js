import client from './client'

export async function listStocks(params = {}) {
  const { data } = await client.get('/stocks', { params })
  return data
}

export async function listAlerts(params = {}) {
  const { data } = await client.get('/stocks/alerts', { params })
  return data
}
