import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const apiKey = req.headers.get('x-openai-key')

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key required' }, { status: 401 })
    }

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Social media graphic for Scriptorfi (human-reviewed transcription service). ${prompt}. Brand colors: teal #0FFCBE and black. Clean, modern, minimalist design. Professional, social-media ready.`,
        n: 1,
        size: '1024x1024',
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message || 'Generation failed' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
