import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Wrapper from '../../components/Wrapper'
import { Formik, Form, FormikHelpers } from 'formik'
import { Button, Box } from '@chakra-ui/react'
import InputField from '../../components/InputField'
import {
  ChangePasswordInput,
  useChangePasswordMutation
} from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'
import { useRouter } from 'next/router'
import { useState } from 'react'

const ChangePassword = ({
  token,
  userId
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // Router
  const router = useRouter()

  // GraphQL
  const [changeUserPassword, _] = useChangePasswordMutation()

  // own state
  const [tokenError, setTokenError] = useState('')

  // Form
  const initialValues = { newPassword: '' }

  const onLoginSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    const response = await changeUserPassword({
      variables: { token, changePasswordInput: values, userId }
    })

    if (response.data?.changePassword.errors) {
      const errorMap = toErrorMap(response.data.changePassword.errors)
      if ('token' in errorMap) {
        setTokenError(errorMap.token)
      }
      setErrors(errorMap)
    } else if (response.data?.changePassword.user) {
      router.push('/')
    }
  }

  return (
    <Wrapper variant="small">
      <Formik initialValues={initialValues} onSubmit={onLoginSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenError ? <Box color="red">{tokenError}</Box> : null}
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

// Phai viet day du kieu nay thi o ben tren phan const ChangePassword({token}) thi token o do moi la dang string
// No SSR for this page
export const getServerSideProps: GetServerSideProps<{
  token: string
  userId: string
}> = async ({ query }) => {
  return {
    props: {
      token: query.token as string,
      userId: query.userId as string
    }
  }
}

export default ChangePassword
