import { Formik, Form } from 'formik'
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'

const Register = () => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={values => console.log(values)}
      >
        {({ values, handleChange }) => (
          <Form>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                placeholder="name"
                value={values.username}
                onChange={handleChange}
              />
              {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
