import {
  Box,
  Heading,
  useToast,
} from '@chakra-ui/react'
import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR, { SWRConfig } from 'swr'
import CustomerTable from '../components/CustomerTable'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { CustomersApiResponse } from '../lib/types/apis/customers'
import { useAuth } from '../providers/auth/AuthProvider'
import { swrFetcher } from '../util/fetcher'

import withAuth from '../util/withAuth'

export const getServerSideProps = (context: GetServerSidePropsContext) => withAuth(context, async (token) => {
  // Fetch posts from APIs
  const url = new URL('/api/customers', process.env.APP_URL)

  // Build API URL
  const result = await fetch(url, {
    headers: {
      cookie: `token=${token}`,
    }
  })

  // Check if response is not ok
  if (!result.ok) {
    return {
      props: {
        fallback: {
          '/api/customers': {
            success: false,
            data: {
              customers: [],
            }
          }
        },
      },
    }
  } else {
    // Parse response
    const response: CustomersApiResponse = await result.json()
    return {
      props: {
        fallback: {
          '/api/customers': {
            success: true,
            data: {
              customers: response.data && response.data.customers ? response.data.customers : [],
            }
          },
        },
      },
    }
  }
}, {
  redirectTo: '/',
  twoFactorEnabled: false,
})


const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => {
  // Load providers
  const { currentUser, logOut } = useAuth()
  const router = useRouter()
  const toast = useToast()

  // Fetch customers from APIs
  const { data: customers, error: customersError, isValidating } = useSWR<CustomersApiResponse>(
    '/api/customers',
    swrFetcher
  )

  useEffect(() => {
    if (customersError) {
      toast({
        title: 'Error',
        description: 'An error occurred while fetching customers.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [customersError, isValidating, toast])


  return (
    <SWRConfig value={{ fallback }}>
      <Navbar
        homeURL="/"
        rightComponent={
          currentUser && [
            <NavbarProfile
              currentUser={currentUser}
              onLogOut={() => {
                // log out
                logOut()
                // redirect to home page
                router.push('/')
              }}
              key="avatar"
            />,
          ]
        }
      />
      <Box marginTop={'60px'} p={6}>
        <Heading>Customers: {customers?.data?.customers.length || "loading..."}</Heading>
        <CustomerTable />
      </Box>
    </SWRConfig>
  )
}

export default HomePage
