import { useRouter } from 'next/router'
import { usePostQuery } from '../generated/graphql'

export const useGetPostFromUrl = () => {
  const router = useRouter()
  return usePostQuery({
    variables: { id: router.query.id as string }
  })
}
