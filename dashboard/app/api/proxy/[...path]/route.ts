import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BACKEND = process.env.API_URL ?? "http://localhost:8000"

function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const session = await getServerSession(authOptions)
  const url = `${BACKEND}/api/v1/${path.join("/")}${request.nextUrl.search}`
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: authHeader(session?.accessToken),
    })
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
  const session = await getServerSession(authOptions)
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  const body = await request.text()
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(session?.accessToken) },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const session = await getServerSession(authOptions)
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  const body = await request.text()
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader(session?.accessToken) },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const session = await getServerSession(authOptions)
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  const body = await request.text()
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader(session?.accessToken) },
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
  const session = await getServerSession(authOptions)
  const url = `${BACKEND}/api/v1/${path.join("/")}`
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeader(session?.accessToken),
    })
    return new NextResponse(null, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 })
  }
}
