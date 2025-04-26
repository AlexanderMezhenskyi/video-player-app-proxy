import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string

  if (!targetUrl) {
    res.status(400).send('Missing url param')
    return
  }

  // Handling preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.status(204).end()
    return
  }

  try {
    const response = await fetch(targetUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch target URL: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const buffer = await response.arrayBuffer()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', contentType)

    // Selecting a caching strategy based on content type
    if (contentType.includes('image') || contentType.includes('video')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable') // 1 day
    } else if (contentType.includes('application/json')) {
      res.setHeader('Cache-Control', 'public, max-age=300') // 5 minutes
    } else if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
      res.setHeader('Cache-Control', 'public, max-age=600') // 10 minutes
    } else {
      res.setHeader('Cache-Control', 'no-cache') // Everything else is without caching
    }

    res.status(200).send(Buffer.from(buffer))
  } catch (error) {
    console.error('Proxy Error:', error)
    res.status(500).send('Proxy error: ' + (error as Error).message)
  }
}
