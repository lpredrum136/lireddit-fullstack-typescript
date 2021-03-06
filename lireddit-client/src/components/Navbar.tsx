import { Box, Flex, Link, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMeQuery } from '../generated/graphql'

const Navbar = () => {
  const { data, loading, error } = useMeQuery()

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
        <Button variant="link">Logout</Button>
      </Flex>
    )
  }

  return (
    <Flex bg="tomato" p={4} ml={'auto'}>
      <Box ml="auto">{body}</Box>
    </Flex>
  )
}

export default Navbar
