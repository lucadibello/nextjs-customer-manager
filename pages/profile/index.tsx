import { Text, Box, Divider, Heading, HStack, IconButton, Tooltip, useToast } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FiRefreshCcw } from "react-icons/fi"
import ChangePasswordForm from "../../components/ChangePasswordForm"
import CopyButton from "../../components/CopyButton"
import Navbar from "../../components/Navbar"
import NavbarProfile from "../../components/NavbarProfile"
import { useAuth } from "../../providers/auth/AuthProvider"
import { useAuthChallenge } from "../../providers/auth/challenge/AuthChallengeProvider"

const ProfilePage = () => {
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false)
  const [isUserChangingPassword, setIsUserChangingPassword] = useState(false)
  const [newUserPassword, setNewUserPassword] = useState<string | null>(null)

  const {
    currentUser,
    logOut,
    refreshSession,
    isAuthenticated,
    accessToken,
    refreshToken,
    changePassword
  } = useAuth()

  const router = useRouter()
  const toast = useToast()
  const { triggerAuthChallenge, purgeAll, isPending, otp, errorMessage } = useAuthChallenge();


  // Wait for the OTP to be generated
  useEffect(() => {
    if (isUserChangingPassword && newUserPassword && !isPending) {
      if (otp) {
        toast({
          title: "OTP generated",
          description: "Your new OTP challenge code has been generated and will be used automatically to update your password.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

        // Now, change password using change password utility
        changePassword(otp, newUserPassword).then(() => {
          toast({
            title: "Password changed",
            description: "Your password has been changed successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          })
        }).catch(err => {
          toast({
            title: "Error",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          })
        }).finally(() => {
          setIsUserChangingPassword(false)
          setNewUserPassword(null)
        })
      } else if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }, [isUserChangingPassword, errorMessage, otp, purgeAll, toast, isPending, newUserPassword, changePassword])

  return (
    <Box>
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
        <Heading>Your profile</Heading>
        <Divider mb={5} />

        {currentUser ? (
          <>
            <HStack>
              <Text fontWeight={'bold'}>User ID</Text>
              <Text>{currentUser.id}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Authenticated?</Text>
              <Text>{isAuthenticated ? 'Yes' : 'No'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Username:</Text>
              <Text>
                {currentUser.name} {currentUser.surname}
              </Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Email:</Text>
              <Text>{currentUser.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Is manager?</Text>
              <Text>{currentUser.role == 'MANAGER' ? 'Yes' : 'No'}</Text>
            </HStack>
            <Heading mt={5}>JWT tokens</Heading>
            <Divider mb={5} />
            <HStack mt={5} gap={10}>
              <Text fontWeight={'bold'}>Access token:</Text>
              <Text maxWidth={'60%'}>{accessToken}</Text>
              {accessToken && (
                <CopyButton
                  value={accessToken}
                  label={'Copy access token'}
                  onSuccessfulCopy={() => {
                    toast({
                      title: 'Copied access token',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                  onFailedCopy={() => {
                    toast({
                      title: 'Failed to copy access token',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                />
              )}

              <Tooltip
                hasArrow
                shouldWrapChildren
                label={'Refresh access token'}
              >
                <IconButton
                  aria-label="Refresh access token"
                  icon={<FiRefreshCcw />}
                  disabled={isTokenRefreshing}
                  onClick={() => {
                    setIsTokenRefreshing(true)
                    refreshSession()
                      .then(() => {
                        toast({
                          title: 'Refreshed access token',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        })
                      })
                      .catch(() => {
                        toast({
                          title: 'Failed to refresh access token',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        })
                      })
                      .finally(() => setIsTokenRefreshing(false))
                  }}
                />
              </Tooltip>
            </HStack>
            <HStack mt={5} gap={10}>
              <Text fontWeight={'bold'}>Refresh token:</Text>
              <Text maxWidth={'60%'}>{refreshToken}</Text>

              {refreshToken && (
                <CopyButton
                  value={refreshToken}
                  label={'Copy refresh token'}
                  onSuccessfulCopy={() => {
                    toast({
                      title: 'Copied refresh token',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                  onFailedCopy={() => {
                    toast({
                      title: 'Failed to copy refresh token',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    })
                  }}
                />
              )}
            </HStack>
          </>
        ) : (
          <Text fontSize="xl">You are not logged in</Text>
        )}

        <Heading>Change password</Heading>
        <Divider mb={5} />

        {/* Two fields, one to confirm the current password, and one to insert the new password */}
        <Box minWidth={"50%"}>
          <ChangePasswordForm
            isLoading={isPending}
            onSuccess={(newPassword: string) => {
              // Set global state to true
              setIsUserChangingPassword(true)
              setNewUserPassword(newPassword)

              // Start the authentication challenge
              triggerAuthChallenge()
            }}
          />
        </Box>
      </Box>
    </Box >
  )
}


export default ProfilePage