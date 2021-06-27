import { gql } from '@apollo/client'
import { Box, Flex, Link, Button, Heading } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
  MeDocument,
  MeQuery,
  PostsDocument,
  PostsQuery,
  useLogoutUserMutation,
  useMeQuery
} from '../generated/graphql'
import { Reference } from '@apollo/client'

const Navbar = () => {
  const [
    logoutUser,
    { loading: useLogoutUserMutationLoading } // vi sao viet duoc nhu nay? xem o duoi
  ] = useLogoutUserMutation()

  const logout = async () => {
    await logoutUser({
      // clear user from cache
      update(cache, { data }) {
        if (data?.logout) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: null
            }
          })

          cache.modify({
            fields: {
              posts(existing) {
                existing.paginatedPosts.forEach((post: Reference) => {
                  cache.writeFragment({
                    id: post.__ref,
                    fragment: gql`
                      fragment VoteStatus on Post {
                        voteStatus
                      }
                    `,
                    data: {
                      voteStatus: 0
                    }
                  })
                })

                console.log('NEW EXISTING', existing)
                return existing
              }
            }
          })
        }
      }
    })
  }

  const { data, loading, error: _useMeQueryError } = useMeQuery() // neu de error khong thi se loi unused, neu chuyen thanh _error thi k duoc vi object k co property nao ten la _error
  // the nen co the doi ten: error: useMeQueryError, va neu k dung toi thi: error: _useMeQueryError

  let body = null

  // Do Navbar la component con cua index.tsx nen bat ki luc nao o home page, i.e. localhost:3000/, no cung se goi MeQuery len, co the kiem chung
  // bang cach console.log nhu sau, khi do o ca browser & console cua Next.js trong VS Code, se nhin thay data la {me: null}
  // Chung ta k muon lam cai viec vo ich nay, boi vi index.tsx chi server-side rendering ra post thoi thi lay user data lam gi, nen o ben tren,
  // cho useMeQuery, chung ta se skip query nay khi dang o trong Server NextJS

  // Updated: Do Ben Awad dung URQL k xin bang Apollo nen Ben Awad phai explicitly skip useMeQuery khi isNextJsServer(), con Apollo xin hon nen
  // ApolloClient da tu dong skip query nay, bang chung la console.log(data) duoi day se tra ve undefined trong NextJS Terminal, tuc la cai
  // useMeQuery khong he chay o phia NextJS server. Neu no chay (tuc la khong nen) thi console.log(data) se tra ve {me: null} trong NextJS Terminal

  // console.log('data', data)

  // data is loading
  if (loading) {
    // do nothing, body === null
  }

  // user not logged in
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )
  }

  // user is logged in
  else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button mr={4}>Create Post</Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant="link"
          onClick={logout}
          isLoading={useLogoutUserMutationLoading}
        >
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex bg="tan" p={4} ml="auto">
      <Flex maxW={800} align="center" flex={1} m="auto">
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  )
}

export default Navbar
