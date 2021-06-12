// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Entity, PrimaryColumn, BaseEntity, ManyToOne, Column } from 'typeorm'
import { User } from './User'
import { Post } from './Post'

// many to many relationship, i.e. users <-> posts
// user -> some join table <- posts
// user -> upvote <- posts

@Entity() // db table
export class Upvote extends BaseEntity {
  @PrimaryColumn() // not auto generated, same as when you do it with ManyToMany()
  userId!: number

  @ManyToOne(_to => User, user => user.upvotes)
  user!: User

  @PrimaryColumn()
  postId!: number

  @ManyToOne(_to => Post, post => post.upvotes)
  post!: Post

  // upvote or downvote?
  @Column()
  value!: number
}
