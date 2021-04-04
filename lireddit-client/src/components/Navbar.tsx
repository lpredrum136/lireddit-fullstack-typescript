import { Box, Flex, Link, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
  MeDocument,
  MeQuery,
  useLogoutUserMutation,
  useMeQuery
} from '../generated/graphql'

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
        }
      }
    })
  }

  const { data, loading, error: _useMeQueryError } = useMeQuery() // neu de error khong thi se loi unused, neu chuyen thanh _error thi k duoc vi object k co property nao ten la _error
  // the nen co the doi ten: error: useMeQueryError, va neu k dung toi thi: error: _useMeQueryError

  let body = null

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
      <Flex>
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
      <Box ml="auto">{body}</Box>
    </Flex>
  )
}

export default Navbar
