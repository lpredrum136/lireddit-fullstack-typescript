import { Box, Button, Link } from '@chakra-ui/react'
import { Formik, Form, FormikHelpers } from 'formik'
import InputField from '../components/InputField'
import {
  CreatePostInput,
  Post,
  PostsDocument,
  PostsQuery,
  useCreatePostMutation
} from '../generated/graphql'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'
import { limit } from './index'

const CreatePost = () => {
  // Router Next
  const router = useRouter()

  // Protect route and redirect
  const { data, loading } = useCheckAuth()

  // GraphQL
  const [createPost, _] = useCreatePostMutation()

  // Formik
  const initialValues = { title: '', text: '' }
  const onCreatePostSubmit = async (
    values: CreatePostInput,
    { setErrors: _ }: FormikHelpers<CreatePostInput>
  ) => {
    try {
      await createPost({
        variables: { createPostInput: values },

        // binh thuong thi new post tu dong chui vao cache, ke ca khi k co ham update() nay
        // nhung de merge function hoat dong duoc thi phai can ham update()
        update(cache, { data }) {
          let postsData = cache.readQuery<PostsQuery>({
            query: PostsDocument
          })
          console.log('BEFORE', postsData)

          // not working
          // cache.modify({
          //   fields: {
          //     posts(existing) {
          //       return {
          //         ...existing,
          //         totalCount: existing.totalCount + 1,
          //         paginatedPosts: [
          //           data?.createPost.post,
          //           ...existing.paginatedPosts
          //         ]
          //       }
          //     }
          //   }
          // })

          // NEW POST automatically added to cache so if we do it like above, it doesn't work
          // must identify the post, and move it to the top
          // cache.modify({
          //   fields: {
          //     posts(existing, { readField }) {
          //       console.log('EXISTING', existing)

          //       if (data?.createPost.success && data.createPost.post) {
          //         const newPostRef = cache.identify(data.createPost.post)

          //         console.log('NEW POST REF', newPostRef)

          //         console.log(
          //           'READ FIELD',
          //           readField('title', data.createPost.post)
          //         )

          //         const newPosts = {
          //           ...existing,
          //           totalCount: existing.totalCount + 1,
          //           paginatedPosts: [
          //             data.createPost.post,
          //             ...existing.paginatedPosts
          //           ]
          //         }

          //         console.log('NEW POSTS', newPosts)

          //         return newPosts
          //       }
          //     }
          //   }
          // })

          // this doesn't work!!!
          if (data?.createPost.success && data.createPost.post) {
            console.log('DATA', data.createPost.post)
            cache.writeQuery(
              /* <PostsQuery> cannot use this because we want to have a flag*/ {
                query: PostsDocument,
                data: {
                  posts: {
                    ...postsData!.posts,
                    paginatedPosts: data.createPost.post as Post
                  }
                }
                // this doesn't matter
                // variables: {
                //   limit: 5
                // }
              }
            )
          }

          postsData = cache.readQuery<PostsQuery>({
            query: PostsDocument
          })
          console.log('AFTER', postsData)
        }
      })
      router.push('/')
    } catch (error) {
      // do nothing, global apolloClient handles this
    }
  }

  // return
  if (loading) return <p>Checking authentication...</p>
  else if (!loading && !data?.me) return <p>Redirecting to login...</p>
  else {
    return (
      <Layout variant="small">
        <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="title"
                placeholder="Title..."
                label="Title"
                type="text"
              />
              <Box mt={4}>
                <InputField
                  textarea
                  name="text"
                  placeholder="Text..."
                  label="Text"
                  type="textarea"
                />
              </Box>

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Create Post
              </Button>
            </Form>
          )}
        </Formik>
        <NextLink href="/">
          <Link>Go back to homepage</Link>
        </NextLink>
      </Layout>
    )
  }
}

export default CreatePost
