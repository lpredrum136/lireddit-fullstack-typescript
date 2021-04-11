import { FieldError } from '../generated/graphql'

// to fix [token].tsx when calling errorMap.token
export const toErrorMap = (errors: FieldError[]): { [key: string]: any } => {
  return errors.reduce(
    (accumulatedErrorsObj, error) => ({
      ...accumulatedErrorsObj,
      [error.field]: error.message
    }),
    {}
  )
}
