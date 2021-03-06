import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
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
  // Me query
  @Query(_returns => User, { nullable: true })
  async me(@Ctx() { em, req }: DbContext): Promise<User | null> {
    // You are not logged in
    console.log(req.session)
    if (!req.session.userId) return null

    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  @Mutation(_returns => UserMutationResponse)
  async register(
    @Arg('registerInput') registerInput: AuthInput,
    @Ctx() { em, req }: DbContext
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

    // store user id session
    // this will set a cookie on the user browser
    // keep them logged in
    req.session.userId = newUser.id

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
    @Ctx() { em, req }: DbContext
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
            field: 'password',
            message: 'Incorrect password'
          }
        ]
      }
    }

    // Login successful here is the thing I want to store in session
    // and all requests will have this req.session.userId so that I know what user is requesting
    // see more in devnotes.txt
    req.session.userId = user.id // you can stick more data here if you want to, anything that doesn't change and unique to a user

    // User found and password correct
    return {
      code: 200,
      success: true,
      message: 'Logged in user successfully',
      user
    }
  }
}
