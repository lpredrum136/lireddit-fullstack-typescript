import { Formik, Form } from 'formik'
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'

const Register = () => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={values => console.log(values)}
      >
        {({ values, handleChange }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="username"
            />
            <InputField
              name="password"
              placeholder="password"
              label="password"
              type="password"
            />
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default Register
