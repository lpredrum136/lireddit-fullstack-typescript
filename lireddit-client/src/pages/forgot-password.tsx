import { Box, Button, Link, Flex } from '@chakra-ui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import { useState } from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import {
  ForgotPasswordInput,
  useForgotPasswordMutation
} from '../generated/graphql'

const ForgotPassword = () => {
  // Form
  const initialValues = {
    email: ''
  }

  // Local state
  const [complete, setComplete] = useState(false)

  // GraphQL
  const [forgotUserPassword, _] = useForgotPasswordMutation()

  // Submit
  const onForgotPasswordSubmit = async (
    values: ForgotPasswordInput,
    { setErrors }: FormikHelpers<ForgotPasswordInput>
  ) => {
    await forgotUserPassword({ variables: { forgotPasswordInput: values } })
    setComplete(true)
  }

  return (
    <Wrapper variant="small">
      <Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email to
              reset password
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="email"
              />

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Send email to me!
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default ForgotPassword
