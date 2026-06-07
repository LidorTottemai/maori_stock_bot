import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.API_URL ?? "http://localhost:8000"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND}/api/v1/${path.join("/")}${request.nextUrl.search}`
  try {
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  const body = await request.text()
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  try {
    const res = await fetch(url, { method: "DELETE" })
    return new NextResponse(null, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}
