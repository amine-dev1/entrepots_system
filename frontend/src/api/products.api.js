import client from './client'
import { listStocks } from './stocks.api'

/**
 * Products catalogue (GET /products is owned by groupe 1 / Ayoub).
 * Until that endpoint is available we transparently derive the catalogue
 * from the products embedded in the /stocks payload, so the Produits page
 * stays functional on the endpoints owned by groupe 2.
 */
export async function listProducts(params = {}) {
  try {
    const { data } = await client.get('/products', { params })
    return data
  } catch (error) {
    if (error.response?.status === 404) {
      return deriveFromStocks()
    }
    throw error
  }
}

async function deriveFromStocks() {
  const res = await listStocks({ per_page: 100 })
  const byId = new Map()
  for (const row of res.data ?? []) {
    if (row.product && !byId.has(row.product.id)) {
      byId.set(row.product.id, row.product)
    }
  }
  return { data: [...byId.values()], _derived: true }
}
