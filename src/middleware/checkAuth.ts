import { DbContext } from '../types'
import { MiddlewareFn } from 'type-graphql'
import { AuthenticationError } from 'apollo-server-errors'

// running before resolver
export const checkAuth: MiddlewareFn<DbContext> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new AuthenticationError(
      'Not authenticated to perform GraphQL operations'
    )
  }

  return next()
}
