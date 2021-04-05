import Navbar from '../components/Navbar'
import { PostsDocument, usePostsQuery } from '../generated/graphql'
import { addApolloState, initialiseApollo } from '../lib/apolloClient'
import { GetStaticProps } from 'next'

const Index = () => {
  const { data } = usePostsQuery()

  return (
    <>
      <Navbar />
      <div>Hello world</div>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map(post => <p key={post.id}>{post.title}</p>)
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initialiseApollo()

  await apolloClient.query({ query: PostsDocument })

  return addApolloState(apolloClient, { props: {} })
}

export default Index
