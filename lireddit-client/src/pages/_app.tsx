// import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { ApolloProvider } from '@apollo/client'
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import { useApollo } from '../lib/apolloClient'
import theme from '../theme'

// Explicitly set to be any because we don't want to deal with it now
function MyApp({ Component, pageProps }: any) {
  const client = useApollo(pageProps)

  return (
    <ApolloProvider client={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
