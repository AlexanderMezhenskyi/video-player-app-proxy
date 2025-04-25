import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string

  if (!targetUrl) {
    res.status(400).send('Missing url param')
    return
  }

  try {
    const response = await fetch(targetUrl)
    const data = await response.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(data)
  } catch (error) {
    res.status(500).send('Proxy error: ' + (error as Error).message)
  }
}
