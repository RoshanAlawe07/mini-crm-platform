import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.CLIENT_ID,
    hasClientSecret: !!process.env.CLIENT_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
