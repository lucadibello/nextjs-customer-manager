import { FormControl, FormLabel, Input, FormErrorMessage, Button } from "@chakra-ui/react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import NewPasswordInput from "./NewPasswordInput"

interface IChangePasswordFormProps {
  onSuccess: (_newPassword: string) => void,
  isLoading?: boolean
}

interface ChangePasswordData {
  newPassword: string
  confirmNewPassword: string
}

const ChangePasswordForm = ({ onSuccess, isLoading }: IChangePasswordFormProps) => {

  const [valid, setValid] = useState<boolean>(false)

  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    control
  } = useForm<ChangePasswordData>({
    defaultValues: {
      newPassword: "",
    }
  })

  const onSubmit = (data: ChangePasswordData) => {
    onSuccess(data.newPassword)
    reset()
    setValid(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.newPassword}>
        <FormLabel htmlFor="currentPassword">Current password</FormLabel>
        <Controller
          name="newPassword"
          control={control}
          render={({ field: { value, onChange, onBlur } }) => (
            <NewPasswordInput
              id="newPassword"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              onValidityChange={(newValid) => {
                // Update valid state if changed
                if (valid !== newValid) {
                  setValid(newValid)
                }
              }}
            />
          )}
        />
        <FormErrorMessage>
          {errors.newPassword && errors.newPassword.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mt={2} isInvalid={!!errors.confirmNewPassword}>
        <FormLabel htmlFor="newPassword">Confirm new password</FormLabel>
        <Input
          id="confirmNewPassword"
          type="password"
          {...register("confirmNewPassword", {
            required: "A confirm password is required",
            validate: (value) => value === watch("newPassword") || "The passwords do not match",
          })}
          disabled={!valid}
        />
        <FormErrorMessage>
          {errors.confirmNewPassword && errors.confirmNewPassword.message}
        </FormErrorMessage>
      </FormControl>

      <Button mt={2} type="submit" isLoading={isSubmitting || isLoading} colorScheme="blue" disabled={!valid}>Change password</Button>
    </form>
  )
}

export default ChangePasswordForm