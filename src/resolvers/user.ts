import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'
import { IMutationResponse } from '../entities/MutationResponse'
import { FieldError } from '../entities/FieldError'
import { COOKIE_NAME } from '../constants'
import { RegisterInput } from '../entities/RegisterInput'
import { LoginInput } from '../entities/LoginInput'
import { validateRegisterInput } from '../utils/validateRegisterInput'
import { sendEmail } from '../utils/sendEmail'
import { v4 as uuidv4 } from 'uuid'

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
  // Forgot password
  @Mutation(_returns => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em }: DbContext) {
    const user = await em.findOne(User, { email })

    if (!user) {
      // email is not registered in db
      return true // not doing anything, doesn't let user know that user exists
    }

    // send email
    const token = uuidv4()
    sessionStore.set()
    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
  }
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
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() { em, req }: DbContext
  ): Promise<UserMutationResponse> {
    const validationResults = validateRegisterInput(registerInput)
    if (validationResults !== null)
      return { code: 400, success: false, ...validationResults }

    const hashedPassword = await argon2.hash(registerInput.password)
    const newUser = em.create(User, {
      username: registerInput.username,
      email: registerInput.email,
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
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() { em, req }: DbContext
  ): Promise<UserMutationResponse> {
    const user = await em.findOne(
      User,
      loginInput.usernameOrEmail.includes('@')
        ? { email: loginInput.usernameOrEmail }
        : { username: loginInput.usernameOrEmail }
    )

    if (!user) {
      return {
        code: 400,
        success: false,
        message: 'Cannot find user',
        errors: [
          {
            field: 'usernameOrEmail',
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

  @Mutation(_returns => Boolean)
  logout(@Ctx() { req, res }: DbContext): Promise<Boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME)

      req.session.destroy(error => {
        if (error) {
          console.log(error)
          resolve(false)
        } else resolve(true)
      })
    })
  }
}
