import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root
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
import { TokenModel } from '../models/Token'
import { ChangePasswordInput } from '../entities/ChangePasswordInput'
import { ForgotPasswordInput } from '../entities/ForgotPasswordInput'

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

@Resolver(_of => User)
export class UserResolver {
  // Protect user email address when queried by another user
  @FieldResolver(_returns => String)
  email(@Root() user: User, @Ctx() { req }: DbContext) {
    // this is the current user and it's ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email
    }

    // current user wants to see someone else's email
    return ''
  }

  // Change password
  @Mutation(_returns => UserMutationResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('userId') userId: string,
    @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @Ctx() { req /*, em */ }: DbContext
  ): Promise<UserMutationResponse> {
    if (changePasswordInput.newPassword.length <= 3) {
      return {
        code: 400,
        success: false,
        message: 'Invalid password',
        errors: [
          {
            field: 'newPassword',
            message: 'Length must be greater than 3'
          }
        ]
      }
    }

    try {
      // check token
      const resetPasswordToken = await TokenModel.findOne({ userId })
      if (!resetPasswordToken) {
        return {
          code: 400,
          success: false,
          message: 'Invalid or expired password reset token',
          errors: [
            {
              field: 'token',
              message: 'Invalid or expired password reset token'
            }
          ]
        }
      }

      const resetPasswordTokenValid = argon2.verify(
        resetPasswordToken.token,
        token
      )
      if (!resetPasswordTokenValid) {
        return {
          code: 400,
          success: false,
          message: 'Invalid or expired password reset token',
          errors: [
            {
              field: 'token',
              message: 'Invalid or expired password reset token'
            }
          ]
        }
      }

      // all ok
      // const user = await em.findOne(User, { id: parseInt(userId) })
      const userIdNum = parseInt(userId)
      const user = await User.findOne(userIdNum)

      if (!user) {
        return {
          code: 400,
          success: false,
          message: 'User no longer exists',
          errors: [
            {
              field: 'token',
              message: 'User no longer exists'
            }
          ]
        }
      }

      // user.password = await argon2.hash(changePasswordInput.newPassword)
      // await em.persistAndFlush(user)

      const updatedPassword = await argon2.hash(changePasswordInput.newPassword)
      await User.update({ id: userIdNum }, { password: updatedPassword })

      // delete the token in MongoDB so user can't keep changing password using the same URL (sent in email)
      await resetPasswordToken.deleteOne()

      // login user after change password
      req.session.userId = user.id

      return {
        code: 200,
        success: true,
        message: 'User password reset successfully',
        user
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        success: false,
        message: 'Internal server error'
      }
    }
  }

  // Forgot password
  @Mutation(_returns => Boolean)
  async forgotPassword(
    @Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput
    // @Ctx() { em }: DbContext
  ): Promise<Boolean> {
    // const user = await em.findOne(User, { email: forgotPasswordInput.email })
    const user = await User.findOne({ email: forgotPasswordInput.email })

    if (!user) {
      // email is not registered in db
      return true // not doing anything, doesn't let user know that user exists
    }

    // find and delete any token associated with this user (user in PostgreSQL, token in MongoDB)
    await TokenModel.findOneAndDelete({ userId: `${user.id}` })

    // create unique token for user to click in email
    const resetToken = uuidv4()
    const hashedResetToken = await argon2.hash(resetToken)

    await new TokenModel({
      userId: `${user.id}`,
      token: hashedResetToken
    }).save()

    await sendEmail(
      forgotPasswordInput.email,
      `<a href="http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}">Click here to reset password</a>`
    )

    return true
  }

  // Me query
  @Query(_returns => User, { nullable: true })
  async me(
    @Ctx() { /* em, */ req }: DbContext
  ): Promise<User | undefined | null> {
    // You are not logged in
    if (!req.session.userId) return null

    // const user = await em.findOne(User, { id: req.session.userId })
    const user = await User.findOne(req.session.userId)
    return user
  }

  @Mutation(_returns => UserMutationResponse)
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() { /* em, */ req }: DbContext
  ): Promise<UserMutationResponse> {
    const validationResults = validateRegisterInput(registerInput)
    if (validationResults !== null)
      return { code: 400, success: false, ...validationResults }

    const hashedPassword = await argon2.hash(registerInput.password)
    // const newUser = em.create(User, {
    //   username: registerInput.username,
    //   email: registerInput.email,
    //   password: hashedPassword
    // })
    const newUser = User.create({
      username: registerInput.username,
      email: registerInput.email,
      password: hashedPassword
    })

    try {
      // await em.persistAndFlush(newUser)
      await newUser.save()
    } catch (error) {
      console.log('Error registering user: ', error)
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
    @Ctx() { /* em, */ req }: DbContext
  ): Promise<UserMutationResponse> {
    // const user = await em.findOne(
    //   User,
    //   loginInput.usernameOrEmail.includes('@')
    //     ? { email: loginInput.usernameOrEmail }
    //     : { username: loginInput.usernameOrEmail }
    // )

    const user = await User.findOne(
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
    console.log(user.id)
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
