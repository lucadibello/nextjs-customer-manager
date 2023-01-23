import {
  Box,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiRefreshCcw } from 'react-icons/fi'
import useSWR, { SWRConfig } from 'swr'
import CopyButton from '../components/CopyButton'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { useAuth } from '../providers/auth/AuthProvider'

import withAuth from '../util/withAuth'

export const getServerSideProps = (context: GetServerSidePropsContext) => withAuth(context, async () => {
  return {
    props: {
      fallback: {
        '/api/posts': {
          data: {
            posts: [],
          },
        },
      },
    },
  }
})

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => {
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false)

  const {
    currentUser,
    logOut,
  } = useAuth()
  const router = useRouter()
  const toast = useToast()

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
        <Heading>Customers</Heading>
        <Box>

        </Box>
      </Box>
    </SWRConfig>
  )
}

export default HomePage
