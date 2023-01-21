import { FormControl, FormLabel, Input, FormErrorMessage, Button } from "@chakra-ui/react"
import { useForm } from "react-hook-form"

interface IChangePasswordFormProps {
  onSuccess: (_newPassword: string) => void,
  isLoading?: boolean
}

interface ChangePasswordData {
  newPassword: string
  confirmNewPassword: string
}

const ChangePasswordForm = ({ onSuccess, isLoading }: IChangePasswordFormProps) => {

  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<ChangePasswordData>()

  const onSubmit = (data: ChangePasswordData) => {
    // call onSuccess callback
    onSuccess(data.newPassword)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.newPassword}>
        <FormLabel htmlFor="currentPassword">Current password</FormLabel>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword", {
            required: "A new password is required",
          })}
        />
        <FormErrorMessage>
          {errors.newPassword && errors.newPassword.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.confirmNewPassword}>
        <FormLabel htmlFor="newPassword">Confirm new password</FormLabel>
        <Input
          id="confirmNewPassword"
          type="password"
          {...register("confirmNewPassword", {
            required: "A confirm password is required",
            validate: (value) => value === watch("newPassword") || "The passwords do not match",
          })}
        />
        <FormErrorMessage>
          {errors.confirmNewPassword && errors.confirmNewPassword.message}
        </FormErrorMessage>
      </FormControl>

      <Button type="submit" isLoading={isSubmitting || isLoading}>Change password</Button>
    </form>
  )
}

export default ChangePasswordForm