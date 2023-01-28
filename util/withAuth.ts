import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { verifyAccessToken } from '../lib/auth'
import { prisma } from '../lib/db'
import { getCookie, hasCookie } from 'cookies-next'

const redirectToLogin = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
}

export type AuthOptions = {
  redirectTo?: string
  twoFactorEnabled?: boolean
}

// Create a getServerSideProps utility function called "withAuth" to check user
const withAuth = async <T extends Object = any>(
  { req, res }: GetServerSidePropsContext,
  onSuccess?: (_token?: string) => Promise<GetServerSidePropsResult<T>>,
  options: AuthOptions = {
    redirectTo: '/login',
    twoFactorEnabled: false,
  }
): Promise<GetServerSidePropsResult<T>> => {
  const token = getCookie('token', { req, res })

  // Get the user's session based on the request
  if (hasCookie('token', { req, res }) && token) {
    // Wair for the token to be verified
    let result
    try {
      result = await verifyAccessToken(token.toString())
    } catch (e) {
      return redirectToLogin
    }

    // Now, check if user exists in the database
    const user = await prisma.employee.findUnique({
      where: {
        EmployeeId: result.id,
      },
    })

    if (!user) {
      return redirectToLogin
    } else if (options.twoFactorEnabled) {
      return redirectToLogin
    } else if (onSuccess) {
      return onSuccess(token.toString())
    } else {
      return {
        props: {} as T,
      }
    }
  } else {
    return redirectToLogin
  }
}

export default withAuth
