import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    message: 'Pages Router API is working!',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}
