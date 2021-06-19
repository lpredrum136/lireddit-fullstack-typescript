import { ChevronUpIcon } from '@chakra-ui/icons'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { PostWithUserInfoFragment, useVoteMutation } from '../generated/graphql'

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment
}

const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [loadingState, setLoadingState] =
    useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>(
      'not-loading'
    )

  const [vote, { loading }] = useVoteMutation()

  const upvote = async (postId: string) => {
    setLoadingState('upvote-loading')
    await vote({ variables: { value: 1, postId: parseInt(postId) } })
    setLoadingState('not-loading')
  }

  const downvote = async (postId: string) => {
    setLoadingState('downvote-loading')
    await vote({ variables: { value: -1, postId: parseInt(postId) } })
    setLoadingState('not-loading')
  }

  return (
    <div>
      <Flex direction="column" alignItems="center" mr={4}>
        <IconButton
          icon={<ChevronUpIcon />}
          aria-label="upvote"
          onClick={upvote.bind(this, post.id)}
          isLoading={loading && loadingState === 'upvote-loading'}
          colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        />
        {post.points} - {post.voteStatus}
        <IconButton
          icon={<ChevronDownIcon />}
          aria-label="downvote"
          onClick={downvote.bind(this, post.id)}
          isLoading={loading && loadingState === 'downvote-loading'}
          colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        />
      </Flex>
    </div>
  )
}

export default UpvoteSection
