import { Box, HStack, Icon, IconButton, Input, InputGroup, InputRightElement, List } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { FiCheck, FiEye, FiEyeOff, FiXCircle } from "react-icons/fi"
import { PasswordComplexityProfile, PasswordComplexityProfiles, validatePassword, ValidationResultState } from "../util/password"

interface INewPasswordInputProps {
  onChange?: (_event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (_event: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  id: string
  complexityProfile?: PasswordComplexityProfile
  onValidityChange?: (_valid: boolean) => void
  value: string
}

const NewPasswordInput = ({
  placeholder,
  onBlur,
  id,
  complexityProfile = PasswordComplexityProfiles.default,
  onValidityChange,
  value,
  onChange
}: INewPasswordInputProps) => {
  const [validFeatures, setValidFeatures] = useState<string[]>([])
  const [invalidFeatures, setInvalidFeatures] = useState<string[]>([])
  const [valid, setValid] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const clearList = () => {
    setValidFeatures([])
    setInvalidFeatures([])
  }

  const handleFeature = (value: ValidationResultState | undefined, message: string) => {
    if (value === 'valid') {
      setValidFeatures((prev) => [...prev, message])
    } else if (value === 'invalid') {
      setInvalidFeatures((prev) => [...prev, message])
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate password using the provided complexity profile
    const report = validatePassword(e.target.value, complexityProfile)

    // Generate the error / success messages based on password complexity report
    handleFeature(report.satisfiesLength, `At least ${complexityProfile.minLength} characters`)
    handleFeature(report.satisfiesMaxLength, `Maximum ${complexityProfile.maxLength} characters`)
    handleFeature(report.satisfiesMinLowerCase, `At least ${complexityProfile.minLowerCase} lowercase characters`)
    handleFeature(report.satisfiesMinUpperCase, `At least ${complexityProfile.minUpperCase} uppercase characters`)
    handleFeature(report.satisfiesMinNumbers, `At least ${complexityProfile.minNumbers} numbers`)
    handleFeature(report.satisfiesMinSymbols, `At least ${complexityProfile.minSymbols} symbols`)

    // Trigger the validity change callback if the password validity has changed
    setValid(report.valid)
    onValidityChange && onValidityChange(report.valid)

    // Trigger on change event callback
    onChange && onChange(e)
  }

  return (
    <Box>
      <InputGroup>
        <Input
          type={showPassword ? 'text' : 'password'}
          isInvalid={isDirty && !valid}
          id={id}
          onChange={(e) => {
            clearList()

            // Set the dirty flag if false
            if (!isDirty)
              setIsDirty(true)

            // Handle password change
            handlePasswordChange(e)
          }}
          value={value}
          onBlur={(e) => {
            // Trigger on blur callback
            onBlur && onBlur(e)

            // Hide the list
            clearList()
          }}
          onFocus={() => {
            // Show the list
            if (value) {
              handlePasswordChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
            } else {
              handlePasswordChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)
            }
          }}
          placeholder={placeholder}
        />
        <InputRightElement>
          <IconButton
            aria-label="Show password"
            icon={showPassword ? <FiEyeOff /> : <FiEye />}
            onClick={() => setShowPassword(!showPassword)}
            variant="ghost"
          />
        </InputRightElement>
      </InputGroup>
      <List>
        <AnimatePresence>
          {validFeatures.length > 0 &&
            validFeatures.map((feature, index) => (
              <HStack
                key={index}
                as={motion.div}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                <Icon name="check" as={FiCheck} color="green.500" />
                <li>{feature}</li>
              </HStack>
            ))
          }
        </AnimatePresence>
        <AnimatePresence>
          {invalidFeatures.length > 0 && invalidFeatures.map((feature, index) => (
            <HStack
              key={index}
              as={motion.div}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              <Icon name="check" as={FiXCircle} color="red.500" />
              <li key={index}>{feature}</li>
            </HStack>
          ))}
        </AnimatePresence>
      </List>
    </Box>
  )
}

export default NewPasswordInput
