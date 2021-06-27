import DataLoader from 'dataloader'
import { Upvote } from '../entities/Upvote'
import { User } from '../entities/User'

const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds)
  return users
  // return userIds.map(userId => users.find(user => user.id === userId) as User) // if you want to be extra careful
}

interface PostVoteStatusCondition {
  postId: number
  userId: number | undefined
}

const batchGetPostVoteStatuses = async (
  postVoteStatusConditions: PostVoteStatusCondition[]
) => {
  const voteStatuses = await Upvote.findByIds(postVoteStatusConditions)
  return postVoteStatusConditions.map(condition =>
    voteStatuses.find(
      status =>
        status.postId === condition.postId && status.userId === condition.userId
    )
  )
}

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User>(userIds =>
    batchGetUsers(userIds as number[])
  ),
  postVoteStatusLoader: new DataLoader<
    PostVoteStatusCondition,
    Upvote | undefined
  >(postVoteStatusConditions =>
    batchGetPostVoteStatuses(
      postVoteStatusConditions as PostVoteStatusCondition[]
    )
  )
})
