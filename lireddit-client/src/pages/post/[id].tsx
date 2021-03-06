import { Box, Heading } from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Layout from '../../components/Layout'
import PostEditDeleteButtons from '../../components/PostEditDeleteButtons'
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery
} from '../../generated/graphql'
import { addApolloState, initialiseApollo } from '../../lib/apolloClient'
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl'
import { limit } from '../index'

const Post = () => {
  const { data, loading, error } = useGetPostFromUrl()

  if (error) return <div>{error.message}</div>

  if (!data?.post)
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    )

  return (
    <Layout>
      {loading ? (
        'Loading...'
      ) : (
        <>
          <Heading mb={4}>{data.post.title}</Heading>
          <Box mb={4}>{data?.post?.text}</Box>
          <PostEditDeleteButtons id={data.post.id} userId={data.post.userId} />
        </>
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const paths = [
  //   {
  //     params: {
  //       id: '104'
  //     }
  //   },
  //   {
  //     params: {
  //       id: '103'
  //     }
  //   },
  //   {
  //     params: {
  //       id: '102'
  //     }
  //   }
  // ]

  const apolloClient = initialiseApollo()

  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: { limit }
  })

  return {
    paths: data.posts.paginatedPosts.map(post => ({
      params: { id: `${post.id}` }
    })),
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = initialiseApollo()
  await apolloClient.query({
    query: PostDocument,
    variables: {
      id: params?.id
    }
  })

  return addApolloState(apolloClient, { props: {} })
  // maybe you can add props: {id: params.id} here to use as variable in usePostQuery above
}

export default Post
