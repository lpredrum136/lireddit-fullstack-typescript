import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import { useField } from 'formik'
import { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  placeholder: string
  type: string
  size?: string // if we dont' have this, Chakra Input will yell, I think this is to override size default inside INputHTMLAttributes<HTMLInputElement>
}

// or you can delete size?: string above, and add {label, size, ...props} here, which will get size from InputHTMLAttributes<HTMLInputElement> I guess
// or cach 3: {label, size: _, ...props} as Ben does, to rename unused variable to _
const InputField = ({ label, ...props }: InputFieldProps) => {
  const [field, { error }] = useField(props)

  return (
    <div>
      <FormControl isInvalid={!!error}>
        {/* field.name here can be props.name, but using field.name ensures that Formik working as expected */}
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <Input {...field} {...props} id={field.name} />
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    </div>
  )
}

export default InputField
