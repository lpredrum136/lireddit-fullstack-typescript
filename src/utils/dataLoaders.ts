import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { User } from '../entities/User'

const batchGetUsers = async (keys: number[]) => {
  return await User.find({ id: In(keys) })
}

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User>(keys =>
    batchGetUsers(keys as number[])
  )
})
