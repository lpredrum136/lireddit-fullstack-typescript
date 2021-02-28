import { gql } from '@apollo/client'

const register = gql`
  mutation RegisterUser($registerInput: AuthInput!) {
    register(registerInput: $registerInput) {
      code
      success
      message
      user {
        id
        username
      }
      errors {
        field
        message
      }
    }
  }
`

export { register }
