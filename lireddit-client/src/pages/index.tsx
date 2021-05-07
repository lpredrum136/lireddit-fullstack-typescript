import { PostsDocument, usePostsQuery } from '../generated/graphql'
import { addApolloState, initialiseApollo } from '../lib/apolloClient'
import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

const limit = 5 // number of posts to get from backend

const Index = () => {
  const { data } = usePostsQuery({ variables: { limit } })
  console.log(data)
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.posts.map(post => (
            <Box key={post.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.text}</Text>
            </Box>
          ))}
        </Stack>
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
