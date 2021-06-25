import {
  PaginatedPosts,
  PostsDocument,
  useDeletePostMutation,
  usePostsQuery
} from '../generated/graphql'
import { addApolloState, initialiseApollo } from '../lib/apolloClient'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { DeleteIcon } from '@chakra-ui/icons'
import Layout from '../components/Layout'
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  IconButton
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { NetworkStatus, Reference } from '@apollo/client'
import UpvoteSection from '../components/UpvoteSection'

export const limit = 5 // number of posts to get from backend

const Index = () => {
  const { data, loading, error, fetchMore, networkStatus } = usePostsQuery({
    variables: { limit },
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true
  })

  const [deletePost, _] = useDeletePostMutation()

  const onPostDelete = async (postId: string) => {
    await deletePost({
      variables: { id: postId },
      update(cache) {
        cache.modify({
          fields: {
            posts(
              existing: Pick<
                PaginatedPosts,
                '__typename' | 'cursor' | 'hasMore' | 'totalCount'
              > & { paginatedPosts: Reference[] }
            ) {
              const newPostsAfterDeletion = {
                ...existing,
                paginatedPosts: existing.paginatedPosts.filter(
                  postRefObj => postRefObj.__ref !== `Post:${postId}`
                )
              }

              return newPostsAfterDeletion
            }
          }
        })
      }
    })
  }

  const loadingMorePosts = networkStatus === NetworkStatus.fetchMore

  const loadMorePosts = () =>
    fetchMore({ variables: { cursor: data?.posts.cursor } })

  if (error || (!loading && !data))
    return <p>Loading posts failed or you have no posts</p>

  return (
    <Layout>
      {loading && !loadingMorePosts ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts.paginatedPosts.map(post => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpvoteSection post={post} />
              <Box flex={1}>
                <NextLink href={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">
                      {post.title} - {post.id}
                    </Heading>
                  </Link>
                </NextLink>

                <Text>posted by {post.user.username}</Text>
                <Flex align="center">
                  <Text mt={4}>{post.textSnippet}</Text>
                  <IconButton
                    ml="auto"
                    icon={<DeleteIcon />}
                    aria-label="delete"
                    colorScheme="red"
                    onClick={onPostDelete.bind(this, post.id)}
                  />
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data?.posts.hasMore && (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={loadingMorePosts}
            onClick={loadMorePosts.bind(this)}
          >
            {loadingMorePosts ? 'Loading' : 'Show more'}
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

// originally used getStaticProps but changed to getServerSideProps for context.req.headers for this request to send the cookie
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initialiseApollo({ headers: context.req.headers })
  await apolloClient.query({ query: PostsDocument, variables: { limit } })

  return addApolloState(apolloClient, { props: {} })
}

export default Index
