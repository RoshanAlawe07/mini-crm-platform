import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth API route is accessible',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}
