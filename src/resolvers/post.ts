import { Post } from '../entities/Post'
import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  ID,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { CreatePostInput } from '../entities/CreatePostInput'
import { checkAuth } from '../middleware/checkAuth'
import { IMutationResponse } from '../entities/MutationResponse'
import { FieldError } from '../entities/FieldError'
// import { sleep } from '../utils/sleep'

@ObjectType({ implements: IMutationResponse })
class PostMutationResponse implements IMutationResponse {
  code: number
  success: boolean
  message?: string

  @Field({ nullable: true })
  post?: Post

  @Field(_type => [FieldError], { nullable: true })
  errors?: FieldError[]
}

@Resolver()
export class PostResolver {
  @Query(_returns => [Post]) // _ is to bypass unused variable error
  async posts(
    @Arg('limit', _type => Int) limit: number,
    @Ctx() { /* em */ connection }: DbContext,
    @Arg('cursor', { nullable: true }) cursor?: string
  ): Promise<Post[]> {
    // MikroORM
    // explicitly declare return type here so if you "return 5" it will yell error
    // return 5
    // Fake slow loading
    // await sleep(3000)
    // return ctx.em.find(Post, {})

    // TypeORM
    // return Post.find()

    // TypeORM with pagination
    const realLimit = Math.min(50, limit) // cap limit at 50
    const query = await connection
      .getRepository(Post)
      .createQueryBuilder('post')
      .orderBy('"createdAt"', 'DESC') // need quotation for postgresql
      .take(realLimit)

    if (cursor) {
      query.where('"createdAt" < :cursor', { cursor }) // from the cursor time point going backward in time
    }

    return query.getMany()
  }

  @Query(_returns => Post, { nullable: true })
  post(
    @Arg('id', _type => ID) id: number // 'id' right after Arg is what we'll write in GraphQL playground, i.e. real GraphQL language
    // @Ctx() { em }: DbContext
  ): Promise<Post | undefined> {
    // return em.findOne(Post, { id })
    return Post.findOne(id)
  }

  @Mutation(_returns => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg('createPostInput') { title, text }: CreatePostInput,
    @Ctx() { req }: DbContext
  ): Promise<PostMutationResponse> {
    // const post = em.create(Post, { title })
    // await em.persistAndFlush(post)
    // return post
    const newPost = Post.create({ title, text, userId: req.session.userId })
    await newPost.save()

    return {
      code: 200,
      success: true,
      message: 'Post created successfully',
      post: newPost
    }
  }

  @Mutation(_returns => Post, { nullable: true })
  async updatePost(
    // @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number,
    @Arg('title', { nullable: true }) title?: string
  ): Promise<Post | null> {
    // mikroORM style
    // const post = await em.findOne(Post, { id })
    // if (!post) return null

    // if (typeof title !== 'undefined') {
    //   // they actually give a new title
    //   post.title = title
    //   await em.persistAndFlush(post)
    // }

    // return post

    let post = await Post.findOne(id)
    if (!post) return null

    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
      post.title = title
    }

    return post
  }

  @Mutation(_returns => Boolean)
  async deletePost(
    // @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number
  ): Promise<boolean> {
    // await em.nativeDelete(Post, { id })
    await Post.delete(id)
    return true
  }
}
