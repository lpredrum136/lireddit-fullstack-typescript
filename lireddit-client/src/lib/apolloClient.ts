import {
  ApolloClient,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject
} from '@apollo/client'
import { useMemo } from 'react'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { onError } from '@apollo/client/link/error'
import Router from 'next/router' // using router outside page component: https://stackoverflow.com/questions/55182529/next-js-router-push-with-state
import { Post } from '../generated/graphql'
// import { concatPagination } from '@apollo/client/utilities'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<NormalizedCacheObject>

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include'
})

// use global error handling to avoid having to deal with authenticated graphql calls every place we call it
const errorLink = onError(errors => {
  if (
    errors.graphQLErrors &&
    errors.graphQLErrors[0].extensions?.code === 'UNAUTHENTICATED'
  ) {
    Router.replace('/login')
  }
})

const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: false,
              merge(existing, incoming) {
                let paginatedPosts: Post[] = []
                console.log('EXISTING', existing)
                console.log('INCOMING', incoming)

                if (existing && existing.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(
                    existing.paginatedPosts
                  )
                }

                if (incoming && incoming.paginatedPosts) {
                  paginatedPosts = paginatedPosts.concat(
                    incoming.paginatedPosts
                  )
                }

                return {
                  ...incoming,
                  paginatedPosts
                }
              }
            }
          }
        }
      }
    })
    // Enable sending cookies over cross-origin requests
    // credentials: 'include'
  })
}

export const initialiseApollo = (initialState: object | null = null) => {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter(d => sourceArray.every(s => !isEqual(d, s)))
      ]
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient
  return _apolloClient
}

// An interface for dynamic pageProps.props
interface IApolloStateProps {
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject
  [key: string]: any
}

export const addApolloState = <T extends { props?: IApolloStateProps }>(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: T
) => {
  if (pageProps.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }
  return pageProps
}

export const useApollo = (pageProps: IApolloStateProps) => {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initialiseApollo(state), [state])
  return store
}

// export const useApollo = (initialState: object | null) => {
//   const store = useMemo(() => initialiseApollo(initialState), [initialState])
//   return store // return the apollo client instance
// }

// THEN IN ANY PAGE YOU CAN DO
// export const getStaticProps = async () => {
//   const apolloClient = initialiseApollo();
//   await apolloClient.query({
//     query: gql`
//        query GetTrip($code: String!) {
//            product: trip_version(where: { trip: { code: { _eq: $code } } }, limit: 1) {
//              usp1
//            }
//        }
//     `,
//     variables: { code: VARIABLE },
//   });
//   return { props: { initialApolloState: apolloClient.cache.extract() } };
// };
