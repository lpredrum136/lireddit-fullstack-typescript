import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
// import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up() // run migrations automatically before anything else

  const app = express()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false
    })
  })

  apolloServer.applyMiddleware({ app })

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
