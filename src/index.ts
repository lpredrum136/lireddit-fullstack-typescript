require('dotenv').config()

import 'reflect-metadata'
// import { MikroORM } from '@mikro-orm/core'
import { COOKIE_NAME, __prod__ } from './constants'
// import { Post } from './entities/Post'
// import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer, ServerRegistration } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

import session from 'express-session'
import cors from 'cors'
import { DbContext } from './types'
import mongoose from 'mongoose'

import connectMongo from 'connect-mongo'
// import { sendEmail } from './utils/sendEmail'

import { createConnection } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'
import path from 'path'
import { Upvote } from './entities/Upvote'
import { buildDataLoaders } from './utils/dataLoaders'

const main = async () => {
  const connection = await createConnection({
    type: 'postgres',

    ...(__prod__
      ? { url: process.env.DB_URL_PROD }
      : {
          database: 'lireddit2',
          username: process.env.DB_USERNAME_DEV,
          password: process.env.DB_PASSWORD_DEV
        }),
    logging: true,
    ...(__prod__ ? {} : { synchronize: true }), // tao db ngay tu khi khoi dong, only in dev, comment out in prod
    entities: [Post, User, Upvote],
    migrations: [path.join(__dirname, '/migrations/*')]
  })

  if (__prod__) await connection.runMigrations() // this was run once to insert 100 rows in post table

  // sendEmail('lpredrum136@gmail.com', 'hi henry') // after you send this, get the console log username and password and hardcode it in sendEmail.ts

  // const orm = await MikroORM.init(mikroConfig)
  // await orm.getMigrator().up() // run migrations automatically before anything else

  const app = express() as ServerRegistration['app'] // fix stupid TS error with apollo-server-express bumped from 2.21.0 to 2.25.2
  app.use(
    cors({
      origin: __prod__
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV,
      credentials: true
    })
  )

  // MongoDB normal connection
  await mongoose.connect(
    `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@lireddit.o1u6x.mongodb.net/lireddit?retryWrites=true&w=majority`,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
  console.log('MongoDB connected yay')

  // Redis session middleware will run before Apollo middleware, because Redis session middleware will be used inside Apollo
  // so it needs to come first
  const mongoStore = connectMongo(session)
  const sessionStore = new mongoStore({
    // this is before forgot password work. Since we use mongodb normally in forgot password work, we can reuse mongoose connection
    // url: `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@lireddit.o1u6x.mongodb.net/lireddit?retryWrites=true&w=majority`

    mongooseConnection: mongoose.connection
  })

  app.set('trust proxy', 1) // for prod

  app.use(
    session({
      name: COOKIE_NAME,
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60, // one hour
        httpOnly: true, // Good practice, JS front end cannot access the cookie
        secure: __prod__, // cookie only works in https
        sameSite: 'lax', // protection against CSRF,
        domain: __prod__ ? '.henrywebdev.site' : undefined // for prod
      },
      secret: process.env.SESSION_SECRET_DEV_PROD!, //a
      saveUninitialized: false, // so you don't save empty sessions, right from the start, when you haven't done anything
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
      // dateScalarMode: 'timestamp' // if you want time in epoch seconds
    }), // this is from typegraphql https://typegraphql.com/docs/bootstrap.html
    context: ({ req, res }): DbContext => ({
      // em: orm.em,
      req,
      res,
      connection, // typeorm connection to be used in resolvers
      dataLoaders: buildDataLoaders()
    }) // to send Post type to the resolver
  })

  apolloServer.applyMiddleware({
    app,
    cors: false // because we're gonna enable cors globally
  })

  // app.get('/', (req, res) => {
  //   res.send('hello')
  // })

  const PORT = process.env.PORT || 4000

  app.listen(PORT, () => {
    console.log(
      `Server started on port 4000. Apollo Server at localhost:4000${apolloServer.graphqlPath}`
    )
  })

  // const post = orm.em.create(Post, { title: 'my first post' })
  // await orm.em.persistAndFlush(post)

  // const posts = await orm.em.find(Post, {})
  // console.log(posts)
}

main().catch(err => {
  console.log('SERVER ERROR', err)
})
