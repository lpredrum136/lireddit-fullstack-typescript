import { PostsDocument, usePostsQuery } from '../generated/graphql'
import { addApolloState, initialiseApollo } from '../lib/apolloClient'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import { Link } from '@chakra-ui/react'
import NextLink from 'next/link'

const limit = 2 // number of posts to get from backend

const Index = () => {
  const { data } = usePostsQuery({ variables: { limit } })

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello world</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map(post => <p key={post.id}>{post.title}</p>)
      )}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initialiseApollo()

  await apolloClient.query({ query: PostsDocument, variables: { limit } })

  return addApolloState(apolloClient, { props: {} })
}

export default Index
