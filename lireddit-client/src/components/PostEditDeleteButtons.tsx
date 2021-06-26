import { Reference } from '@apollo/client'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
  Maybe,
  PaginatedPosts,
  useDeletePostMutation,
  useMeQuery
} from '../generated/graphql'

interface PostEditDeleteButtonsProps {
  id: string
  userId: Maybe<number> | undefined
}

const PostEditDeleteButtons = ({ id, userId }: PostEditDeleteButtonsProps) => {
  const { data: meData } = useMeQuery()

  const [deletePost, _] = useDeletePostMutation()

  const onPostDelete = async (postId: string) => {
    await deletePost({
      variables: { id: postId },
      update(cache, { data }) {
        if (data?.deletePost.success)
          cache.modify({
            fields: {
              posts(
                existing: Pick<
                  PaginatedPosts,
                  '__typename' | 'cursor' | 'hasMore' | 'totalCount'
                > & { paginatedPosts: Reference[] }
              ) {
                const newPostsAfterDeletion = {
                  ...existing,
                  paginatedPosts: existing.paginatedPosts.filter(
                    postRefObj => postRefObj.__ref !== `Post:${postId}`
                  )
                }

                return newPostsAfterDeletion
              }
            }
          })
      }
    })
  }

  if (meData?.me?.id === userId?.toString()) return null

  return (
    <Box>
      <NextLink href={`/post/edit/${id}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete"
        colorScheme="red"
        onClick={onPostDelete.bind(this, id)}
      />
    </Box>
  )
}

export default PostEditDeleteButtons
