export interface PasswordComplexityProfile {
  minLength: number
  maxLength: number
  minLowerCase: number
  minUpperCase: number
  minNumbers: number
  minSymbols: number // !@#$%^&*()_+-=[]{}|;':",./<>?
}

export type ValidationResultState = 'valid' | 'invalid' | 'disabled'

export interface ValidationResult {
  valid: boolean

  satisfiesLength?: ValidationResultState
  satisfiesMaxLength?: ValidationResultState
  satisfiesMinLowerCase?: ValidationResultState
  satisfiesMinUpperCase?: ValidationResultState
  satisfiesMinNumbers?: ValidationResultState
  satisfiesMinSymbols?: ValidationResultState
}

export const validatePassword = (
  value: string,
  complexity: PasswordComplexityProfile
): ValidationResult => {
  // Utility arrow function
  const checkIfDisabled = (value: number): ValidationResultState => {
    return value === 0 ? 'disabled' : 'invalid'
  }

  // Validate password features and, if valid/invalid, fill a report object
  const report: ValidationResult = {
    valid: false,
    satisfiesLength: checkIfDisabled(complexity.minLength),
    satisfiesMaxLength: checkIfDisabled(complexity.maxLength),
    satisfiesMinLowerCase: checkIfDisabled(complexity.minLowerCase),
    satisfiesMinUpperCase: checkIfDisabled(complexity.minUpperCase),
    satisfiesMinNumbers: checkIfDisabled(complexity.minNumbers),
    satisfiesMinSymbols: checkIfDisabled(complexity.minSymbols),
  }

  // For each not disabled feature, check if it is valid
  if (report.satisfiesLength !== 'disabled') {
    report.satisfiesLength =
      value.length >= complexity.minLength ? 'valid' : 'invalid'
  }

  if (report.satisfiesMaxLength !== 'disabled') {
    report.satisfiesMaxLength =
      value.length <= complexity.maxLength ? 'valid' : 'invalid'
  }

  if (report.satisfiesMinLowerCase !== 'disabled') {
    report.satisfiesMinLowerCase =
      value.replace(/[^a-z]/g, '').length >= complexity.minLowerCase
        ? 'valid'
        : 'invalid'
  }

  if (report.satisfiesMinUpperCase !== 'disabled') {
    report.satisfiesMinUpperCase =
      value.replace(/[^A-Z]/g, '').length >= complexity.minUpperCase
        ? 'valid'
        : 'invalid'
  }

  if (report.satisfiesMinNumbers !== 'disabled') {
    report.satisfiesMinNumbers =
      value.replace(/[^0-9]/g, '').length >= complexity.minNumbers
        ? 'valid'
        : 'invalid'
  }

  if (report.satisfiesMinSymbols !== 'disabled') {
    report.satisfiesMinSymbols =
      value.replace(/[^!@#$%^&*()_+-=[]{}|;':",.\/<>?]/g, '').length >=
      complexity.minSymbols
        ? 'valid'
        : 'invalid'
  }

  // If all features are valid, return true
  if (
    report.satisfiesLength === 'valid' &&
    report.satisfiesMaxLength === 'valid' &&
    report.satisfiesMinLowerCase === 'valid' &&
    report.satisfiesMinUpperCase === 'valid' &&
    report.satisfiesMinNumbers === 'valid' &&
    report.satisfiesMinSymbols === 'valid'
  ) {
    report.valid = true
  }

  // Return the report
  return report
}

// Build some pre-defined password complexity profiles
export const PasswordComplexityProfiles: Record<
  'default' | 'strong' | 'weak',
  PasswordComplexityProfile
> = {
  // Minimum 8 characters, no maximum length
  // At least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol
  default: {
    minLength: 8,
    maxLength: 14,
    minLowerCase: 1,
    minUpperCase: 1,
    minNumbers: 1,
    minSymbols: 1,
  },
  // Minimum 12 characters, no maximum length
  // At least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol
  strong: {
    minLength: 12,
    maxLength: 14,
    minLowerCase: 1,
    minUpperCase: 1,
    minNumbers: 1,
    minSymbols: 1,
  },

  // Minimum 6 characters, no maximum length
  // At least 1 lowercase letter, 1 uppercase letter, 1 number, 1 symbol
  weak: {
    minLength: 6,
    maxLength: 14,
    minLowerCase: 1,
    minUpperCase: 1,
    minNumbers: 1,
    minSymbols: 1,
  },
}
