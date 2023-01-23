import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useAuth } from "../providers/auth/AuthProvider"
import { startChallenge } from "../util/challenge"

interface IAuthChallengeProps {
  isOpen: boolean
  onClose: () => void,
  onSuccess: (_otp: string) => void,
  onError: (_message: string) => void,
}

interface ChallengeData {
  password: string
}

const AuthChallenge = ({ isOpen, onClose, onSuccess, onError }: IAuthChallengeProps) => {
  const { currentUser } = useAuth();

  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChallengeData>()

  const onSubmit = (data: ChallengeData) => {
    // Try to login user with password
    if (currentUser) {
      startChallenge({
        email: currentUser.email,
        password: data.password,
      }).then((otp) => {
        // Challenge started successfully
        onSuccess(otp);
      }).catch(() => {
        // Challenge failed
        onError("Incorrect password provided");
      })
    } else {
      // No user found, must be a problem with the auth provider
      onError("No user found in session. Please try again later.");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Authentication challenge</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "A password is required to solve this challenge",
                })}
              />
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
          </form>

        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr={3} isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Solve challenge
          </Button>
          <Button variant='ghost' onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AuthChallenge
