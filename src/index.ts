import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { COOKIE_NAME, __prod__ } from './constants'
// import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
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

require('dotenv')

const main = async () => {
  // sendEmail('lpredrum136@gmail.com', 'hi henry') // after you send this, get the console log username and password and hardcode it in sendEmail.ts
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up() // run migrations automatically before anything else

  const app = express()
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  )

  // MongoDB normal connection
  await mongoose.connect(
    `mongodb+srv://${process.env.SESSION_DB_USERNAME}:${process.env.SESSION_DB_PASSWORD}@lireddit.o1u6x.mongodb.net/lireddit?retryWrites=true&w=majority`,
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
    // url: `mongodb+srv://${process.env.SESSION_DB_USERNAME}:${process.env.SESSION_DB_PASSWORD}@lireddit.o1u6x.mongodb.net/lireddit?retryWrites=true&w=majority`

    mongooseConnection: mongoose.connection
  })

  app.use(
    session({
      name: COOKIE_NAME,
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60, // one hour
        httpOnly: true, // Good practice, JS front end cannot access the cookie
        secure: __prod__, // cookie only works in https
        sameSite: 'lax' // protection against CSRF
      },
      secret: process.env.SESSION_SECRET!, //a
      saveUninitialized: false, // so you don't save empty sessions, right from the start, when you haven't done anything
      resave: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): DbContext => ({
      em: orm.em,
      req,
      res
    }) // to send Post type to the resolver
  })

  apolloServer.applyMiddleware({
    app,
    cors: false // because we're gonna enable cors globally
  })

  // app.get('/', (req, res) => {
  //   res.send('hello')
  // })

  app.listen(4000, () => {
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
  console.log(err)
})
