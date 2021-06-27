import DataLoader from 'dataloader'
import { User } from '../entities/User'

const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds)
  return users
  // return userIds.map(userId => users.find(user => user.id === userId) as User) // if you want to be extra careful
}

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User>(userIds =>
    batchGetUsers(userIds as number[])
  )
})
