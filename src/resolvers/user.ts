import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver
} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'
import { IMutationResponse } from '../entities/MutationResponse'
import { FieldError } from '../entities/FieldError'

@InputType()
class AuthInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType({ implements: IMutationResponse })
class UserMutationResponse implements IMutationResponse {
  code: number
  success: boolean
  message?: string

  @Field({ nullable: true })
  user?: User

  @Field(_type => [FieldError], { nullable: true })
  errors?: FieldError[]
}

@Resolver()
export class UserResolver {
  @Mutation(_returns => UserMutationResponse)
  async register(
    @Arg('registerInput') registerInput: AuthInput,
    @Ctx() { em }: DbContext
  ): Promise<UserMutationResponse> {
    if (registerInput.username.length <= 2) {
      return {
        code: 400,
        success: false,
        message: 'Invalid username',
        errors: [
          {
            field: 'username',
            message: 'Length must be greater than 2'
          }
        ]
      }
    }

    if (registerInput.password.length <= 3) {
      return {
        code: 400,
        success: false,
        message: 'Invalid password',
        errors: [
          {
            field: 'password',
            message: 'Length must be greater than 3'
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(registerInput.password)
    const newUser = em.create(User, {
      username: registerInput.username,
      password: hashedPassword
    })

    try {
      await em.persistAndFlush(newUser)
    } catch (error) {
      if (error.code === '23505' || error.detail.includes('already exists'))
        // duplicate username
        return {
          code: 400,
          success: false,
          message: 'Duplicate username',
          errors: [{ field: 'username', message: 'Username already exists' }]
        }
    }

    return {
      code: 200,
      success: true,
      message: 'Created user successfully',
      user: newUser
    } // newUser here actually contains password field but since in User.ts entity, we didn't mark it as a GraphQL field, it doesn't get returned to GraphQL
  }

  @Mutation(_returns => UserMutationResponse)
  async login(
    @Arg('loginInput') loginInput: AuthInput,
    @Ctx() { em }: DbContext
  ): Promise<UserMutationResponse> {
    const user = await em.findOne(User, { username: loginInput.username })
    if (!user) {
      return {
        code: 400,
        success: false,
        message: 'Cannot find user',
        errors: [
          {
            field: 'username',
            message: 'Username does not exist'
          }
        ]
      }
    }

    // User found
    const passwordValid = await argon2.verify(
      user.password,
      loginInput.password
    )
    if (!passwordValid) {
      return {
        code: 400,
        success: false,
        message: 'Wrong password. Try again',
        errors: [
          {
            field: 'username',
            message: 'Incorrect password'
          }
        ]
      }
    }

    // User found and password correct
    return {
      code: 200,
      success: true,
      message: 'Logged in user successfully',
      user
    }
  }
}
