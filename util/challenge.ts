import { StartChallengeApiResponse } from '../lib/types/auth'

interface IStartChallengeAuth {
  email: string
  password: string
}

const startChallenge = async ({
  email,
  password,
}: IStartChallengeAuth): Promise<string> => {
  return await fetch('/api/challenge/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  }).then(async res => {
    // Convert to StartChallengeApiResponse
    const result: StartChallengeApiResponse = await res.json()
    if (!result.success || !result.data) throw new Error(result.message)

    // Return the challenge ID if successful
    return result.data.challenge
  })
}

const endChallenge = async (email: string, otp: string) => {
  console.log(otp)
}

export { startChallenge, endChallenge }
