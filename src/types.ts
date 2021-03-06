// import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core'
import { Request, Response } from 'express'
import { Session, SessionData } from 'express-session'
import { Connection } from 'typeorm'
import { buildDataLoaders } from './utils/dataLoaders'

export type DbContext = {
  // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number } // & just joins these types together
  }
  res: Response
  connection: Connection
  dataLoaders: ReturnType<typeof buildDataLoaders>
}
