import { DbContext } from '../types'
import { MiddlewareFn } from 'type-graphql'

// running before resolver
export const checkAuth: MiddlewareFn<DbContext> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new Error('Not authenticated to perform GraphQL operations')
  }

  return next()
}
