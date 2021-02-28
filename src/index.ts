import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
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

import connectMongo from 'connect-mongo'

require('dotenv')

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up() // run migrations automatically before anything else

  const app = express()
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  )

  // Redis session middleware will run before Apollo middleware, because Redis session middleware will be used inside Apollo
  // so it needs to come first
  const mongoStore = connectMongo(session)

  app.use(
    session({
      name: 'lireddit-cookie',
      store: new mongoStore({
        url: `mongodb+srv://${process.env.SESSION_DB_USERNAME}:${process.env.SESSION_DB_PASSWORD}@lireddit.o1u6x.mongodb.net/lireddit?retryWrites=true&w=majority`
      }),
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
    context: ({ req, res }): DbContext => ({ em: orm.em, req, res }) // to send Post type to the resolver
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
