import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasClientId: !!process.env.CLIENT_ID,
      hasClientSecret: !!process.env.CLIENT_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    }
  })
}