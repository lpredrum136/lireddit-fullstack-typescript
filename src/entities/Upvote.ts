// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Entity, PrimaryColumn, BaseEntity, ManyToOne, Column } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { User } from './User'
import { Post } from './Post'

// many to many relationship, i.e. users <-> posts
// user -> some join table <- posts
// user -> upvote <- posts

@ObjectType() // graphql stuff
@Entity() // db table
export class Upvote extends BaseEntity {
  @Field()
  @PrimaryColumn() // not auto generated, same as when you do it with ManyToMany()
  userId!: number

  @Field(_type => User)
  @ManyToOne(_to => User, user => user.upvotes)
  user!: User

  @Field()
  @PrimaryColumn()
  postId!: number

  @Field(_type => Post)
  @ManyToOne(_to => Post, post => post.upvotes)
  post!: Post

  // upvote or downvote?
  @Field()
  @Column()
  value!: number
}
