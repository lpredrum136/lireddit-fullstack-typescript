import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Wrapper from '../../components/Wrapper'
import { Formik, Form, FormikHelpers } from 'formik'
import { Button, Box, Link, Flex } from '@chakra-ui/react'
import InputField from '../../components/InputField'
import {
  ChangePasswordInput,
  useChangePasswordMutation
} from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NextLink from 'next/link'

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
            {tokenError ? (
              <Flex>
                <Box color="red" mr={2}>
                  {tokenError}
                </Box>
                <NextLink href="forgot-password">
                  <Link>Go forget password again!</Link>
                </NextLink>
              </Flex>
            ) : null}
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
