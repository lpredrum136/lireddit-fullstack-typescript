import { Post } from '../entities/Post'
import { DbContext } from '../types'
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  ID,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from 'type-graphql'
import { CreatePostInput } from '../entities/CreatePostInput'
import { checkAuth } from '../middleware/checkAuth'
import { IMutationResponse } from '../entities/MutationResponse'
import { FieldError } from '../entities/FieldError'
import { PaginatedPosts } from '../entities/PaginatedPosts'
import { User } from '../entities/User'
import { Upvote } from '../entities/Upvote'
import { UserInputError } from 'apollo-server-errors'
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

@Resolver(_of => Post) // Only when we have FieldResolver, in which case we are explicitly saying we are trying to resolve Post type
export class PostResolver {
  // Field Resolver
  @FieldResolver(_returns => String) // sometimes typegraphql just complains it cannot infer the type :(
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50)
  }

  // return real User to user field of type Post
  @FieldResolver(_returns => User)
  async user(@Root() rootPostResult: Post) {
    return await User.findOne(rootPostResult.userId)
  }

  @Query(_returns => PaginatedPosts) // _ is to bypass unused variable error
  async posts(
    @Arg('limit', _type => Int) limit: number,
    @Ctx() { /* em */ connection }: DbContext,
    @Arg('cursor', { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts> {
    // MikroORM
    // explicitly declare return type here so if you "return 5" it will yell error
    // return 5
    // Fake slow loading
    // await sleep(3000)
    // return ctx.em.find(Post, {})

    // TypeORM
    // return Post.find()

    // TypeORM with pagination
    const totalPostCount = await Post.count()

    const realLimit = Math.min(50, limit) // cap limit at 50
    const paginatedPostsQuery = connection
      .getRepository(Post)
      .createQueryBuilder('post')
      .orderBy('"createdAt"', 'DESC') // need quotation for postgresql
      .take(realLimit)

    // Deal with cursor
    let lastPaginatedPost: Post | undefined
    if (cursor) {
      paginatedPostsQuery.where('"createdAt" < :cursor', { cursor }) // from the cursor time point going backward in time
      lastPaginatedPost = await connection
        .getRepository(Post)
        .createQueryBuilder('post')
        .orderBy('"createdAt"', 'ASC')
        .take(1)
        .getOne()
    }

    const posts = await paginatedPostsQuery.getMany()

    // Cach khac de xac dinh hasMore la lay them +1 vao realLimit, tuc la luon luon query them 1 post, khi do
    // paginatedPosts: posts.slice (0, realLimit)
    // hasMore se la posts.length !== realLimit
    return {
      totalCount: totalPostCount,
      cursor: posts[posts.length - 1].createdAt,
      hasMore: cursor
        ? posts[posts.length - 1].createdAt.toString() !==
          lastPaginatedPost?.createdAt.toString() // toString because if compared originally, it doesn't return correct result, even though console.log() outputs the same
        : posts.length !== totalPostCount,
      paginatedPosts: posts
    }
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

  @Mutation(_returns => PostMutationResponse, { nullable: true })
  @UseMiddleware(checkAuth)
  async updatePost(
    // @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number,
    @Arg('title', { nullable: true }) title?: string
  ): Promise<PostMutationResponse> {
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
    if (!post)
      return {
        code: 400,
        success: false,
        message: 'Post not found'
      }

    // or cach 2. post.title = title roi await post.save()
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
      post.title = title
    }

    return {
      code: 200,
      success: true,
      message: 'Post updated successfully',
      post
    }
  }

  @Mutation(_returns => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    // @Ctx() { em }: DbContext,
    @Arg('id', _type => ID) id: number
  ): Promise<PostMutationResponse> {
    // await em.nativeDelete(Post, { id })
    await Post.delete(id)
    return {
      code: 200,
      success: true,
      message: 'Post deleted successfully'
    }
  }

  @Mutation(_returns => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg('postId', _type => Int) postId: number,
    @Arg('value', _type => Int) value: number,
    @Ctx() { req, connection }: DbContext
  ): Promise<PostMutationResponse> {
    return await connection.transaction(async transactionalEntityManager => {
      const realValue = value !== -1 ? 1 : -1
      const { userId } = req.session

      // find the post that needs its points changed
      let post = await transactionalEntityManager.findOne(Post, postId)
      if (!post) {
        throw new UserInputError('Post not found')
      }

      // check if user has voted or not
      const existingVote = await transactionalEntityManager.findOne(Upvote, {
        postId,
        userId
      })

      // change from upvote to downvote or vice versa

      if (existingVote && existingVote.value !== realValue) {
        console.log('HERE')
        // update value 1 to -1 and vice versa
        await transactionalEntityManager.save(Upvote, {
          ...existingVote,
          value: realValue
        })

        // save() cach 1
        post = await transactionalEntityManager.save(Post, {
          ...post,
          points: post.points + 2 * realValue // remove one upvote, and add one downvote, so doubled!
        })
      }

      // never voted before
      if (!existingVote) {
        console.log('OR HERE')
        const newVote = transactionalEntityManager.create(Upvote, {
          userId,
          postId,
          value: realValue
        })
        await transactionalEntityManager.save(newVote)

        // save() cach 2
        post.points = post.points + realValue
        post = await transactionalEntityManager.save(post)
      }

      return {
        code: 200,
        success: true,
        message: 'Post voted',
        post
      }
    })
  }
}
