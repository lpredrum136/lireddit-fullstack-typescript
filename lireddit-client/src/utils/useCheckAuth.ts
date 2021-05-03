import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'

export const useCheckAuth = () => {
  const router = useRouter()
  // Protect route
  const { data, loading } = useMeQuery() // under the hood, this is checking in the graphql cache, so you don't waste resource making http request to server
  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace(`/login?redirect=${router.route}`)
    }
  }, [data, loading, router])
  return { data, loading }
}
