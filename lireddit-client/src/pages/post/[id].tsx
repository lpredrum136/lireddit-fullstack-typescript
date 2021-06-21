import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery,
  usePostQuery
} from '../../generated/graphql'
import { addApolloState, initialiseApollo } from '../../lib/apolloClient'
import { limit } from '../index'

const Post = () => {
  const router = useRouter()

  const { data, loading } = usePostQuery({
    variables: {
      id: router.query.id as string
    }
  })

  return <Layout>{loading ? 'Loading...' : data?.post?.text}</Layout>
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
