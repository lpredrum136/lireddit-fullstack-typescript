import { Post } from '../entities/Post'
import { DbContext } from '../types'
import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql'
// import { sleep } from '../utils/sleep'

@Resolver()
export class PostResolver {
  @Query(_returns => [Post]) // _ is to bypass unused variable error
  async posts(@Ctx() ctx: DbContext): Promise<Post[]> {
    // explicitly declare return type here so if you "return 5" it will yell error
    // return 5

    // Fake slow loading
    // await sleep(3000)

    return ctx.em.find(Post, {})
  }

  @Query(_returns => Post, { nullable: true })
  post(
    @Arg('id', _type => ID) id: number, // 'id' right after Arg is what we'll write in GraphQL playground, i.e. real GraphQL language
    @Ctx() { em }: DbContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  @Mutation(_returns => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: DbContext
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  @Mutation(_returns => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number,
    @Arg('title', { nullable: true }) title?: string
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id })
    if (!post) return null

    if (typeof title !== 'undefined') {
      // they actually give a new title
      post.title = title
      await em.persistAndFlush(post)
    }

    return post
  }

  @Mutation(_returns => Boolean)
  async deletePost(
    @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id })
    return true
  }
}
