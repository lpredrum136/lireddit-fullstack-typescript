import { Formik, Form } from 'formik'

import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'

import { register } from '../graphql-client/mutations'
import { useMutation } from '@apollo/client'

const Register = () => {
  // Form
  const initialValues = {
    username: '',
    password: ''
  }

  const onRegisterSubmit = values => {
    return registerUser({ variables: { registerInput: values } })
  }

  // GraphQL operations
  interface UserMutationResponse {
    code: number
    success: boolean
    message: string
    user: string
    errors: string
  }
  interface INewUser {
    username: string
    password: string
  }

  const [registerUser, { error, data }] = useMutation<
    { register: UserMutationResponse },
    { registerInput: INewUser }
  >(register)

  return (
    <Wrapper variant="small">
      {error && <p>Failed to register. Server error.</p>}
      {data && data.register.success ? (
        <p>Registered successfully {JSON.stringify(data)}</p>
      ) : null}
      <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Username"
              label="Username"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
