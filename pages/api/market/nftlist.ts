import type { NextApiRequest, NextApiResponse } from 'next'

// Market NFT List
export default function useHandler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ data: [] })
}

