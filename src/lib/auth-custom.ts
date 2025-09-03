import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('pmcell-auth-token')?.value
    
    if (!token) {
      return null
    }

    return await verifyAuthToken(token)
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

export function requireAuth(allowedRoles: string[] = ['ADMIN', 'EMPLOYEE']) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!allowedRoles.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return user
  }
}