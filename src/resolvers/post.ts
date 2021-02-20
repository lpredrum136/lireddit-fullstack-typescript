import { Post } from '..//entities/Post'
import { DbContext } from '..//types'
import { Arg, Ctx, ID, Mutation, Query, Resolver } from 'type-graphql'

@Resolver()
export class PostResolver {
  @Query(returns => [Post])
  posts(@Ctx() ctx: DbContext): Promise<Post[]> {
    // explicitly declare return type here so if you "return 5" it will yell error
    // return 5
    return ctx.em.find(Post, {})
  }

  @Query(returns => Post, { nullable: true })
  post(
    @Arg('id', type => ID) id: number, // 'id' right after Arg is what we'll write in GraphQL playground, i.e. real GraphQL language
    @Ctx() { em }: DbContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  @Mutation(returns => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: DbContext
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  @Mutation(returns => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: DbContext,
    @Arg('id', type => ID) id: number,
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

  @Mutation(returns => Boolean)
  async deletePost(
    @Ctx() { em }: DbContext,
    @Arg('id', type => ID) id: number
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id })
    return true
  }
}
