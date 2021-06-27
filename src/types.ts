// import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core'
import DataLoader from 'dataloader'
import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { Connection } from 'typeorm'
import { User } from './entities/User'

export type DbContext = {
  // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number } // & just joins these types together
  }
  res: Response
  connection: Connection
  dataLoaders: {
    userLoader: DataLoader<number, User>
  }
}
