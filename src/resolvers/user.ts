import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  Resolver
} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'

@InputType()
class RegisterInput {
  @Field()
  username: string

  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  @Mutation(_returns => User)
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() { em }: DbContext
  ): Promise<User> {
    const hashedPassword = await argon2.hash(registerInput.password)
    const newUser = em.create(User, {
      username: registerInput.username,
      password: hashedPassword
    })
    const result = await em.persistAndFlush(newUser)

    return newUser // newUser here actually contains password field but since in User.ts entity, we didn't mark it as a GraphQL field, it doesn't get returned to GraphQL
  }

  // @Mutation(_returns => Post, { nullable: true })
  // async updatePost(
  //   @Ctx() { em }: DbContext,
  //   @Arg('id', _type => ID) id: number,
  //   @Arg('title', { nullable: true }) title?: string
  // ): Promise<Post | null> {
  //   const post = await em.findOne(Post, { id })
  //   if (!post) return null

  //   if (typeof title !== 'undefined') {
  //     // they actually give a new title
  //     post.title = title
  //     await em.persistAndFlush(post)
  //   }

  //   return post
  // }

  // @Mutation(_returns => Boolean)
  // async deletePost(
  //   @Ctx() { em }: DbContext,
  //   @Arg('id', _type => ID) id: number
  // ): Promise<boolean> {
  //   await em.nativeDelete(Post, { id })
  //   return true
  // }
}
