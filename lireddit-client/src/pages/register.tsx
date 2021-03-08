import { Formik, Form, FormikHelpers } from 'formik'

import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { Box, Button } from '@chakra-ui/react'
import {
  AuthInput,
  MeDocument,
  MeQuery,
  useRegisterUserMutation
} from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'

import { useRouter } from 'next/router'

// import { register } from '../graphql-client/mutations/mutations' // old, without graphql codegen
// import { useMutation } from '@apollo/client' // old, without graphql codegen

const Register = () => {
  // Router Next
  const router = useRouter()

  // Form
  const initialValues = {
    username: '',
    password: ''
  }

  const onRegisterSubmit = async (
    values: AuthInput,
    { setErrors }: FormikHelpers<AuthInput>
  ) => {
    // o params ben tren: values cung duoc nhung neu client/tsconfig.json/strict la true thi no se bat loi
    // con cai setErrors la tu may mo ra day haha

    const response = await registerUser({
      variables: { registerInput: values },
      update(cache, { data }) {
        // De xem 3 cach khac nhau de update cache va tai sao dung cach nao thi xem login.tsx

        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.register.user // nho la data.register.user o day phai trung voi shape cua "me", tuc la co id va username, vay nen Fragment la rat can thiet
            }
          })
        }
      }
    }) // response here is the {data: ....} below, when you use useRegisterUserMutation(). So you can response.data.register.user

    if (response.data?.register.errors) {
      // if you do response.data.register.errors, if response.data is undefined, it will throw an error
      // adding a '?' to response.data says: if it's not undefined, dig down to register.errors, but if it is undefined, return undefined

      // For example, setErrors() is from Formik
      // setErrors({
      //   username: 'Hi error'
      // })

      setErrors(toErrorMap(response.data.register.errors))
    } else if (response.data?.register.user) {
      // register successful
      router.push('/')
    }
  }

  // GraphQL operations

  const [registerUser, { loading, error, data }] = useRegisterUserMutation() // custom hook created by graphql codegen
  // error here is server error, kinda like you have a typo somewhere
  // data is real structured data returned from GraphQL server (if you didn't make any typo)

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
