import { __prod__ } from './constants'
import { Post } from './entities/Post'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { User } from './entities/User'

require('dotenv').config({ debug: !__prod__ })

const mikroConfig = {
  migrations: {
    path: path.join(__dirname, 'migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/ // regex pattern for the migration files, both .js and .ts file
  },
  entities: [Post, User], // db tables
  // clientUrl: 'postgres://localhost',
  dbName: 'lireddit',
  type: 'postgresql',
  // user: 'postgres',
  password: process.env.DB_PASSWORD,
  // port: 11874, // see it if you open pgAdmin
  debug: !__prod__
} as Parameters<typeof MikroORM.init>[0]

export default mikroConfig
