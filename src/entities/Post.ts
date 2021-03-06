// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany
} from 'typeorm'
import { Field, ID, Int, ObjectType } from 'type-graphql'
import { User } from './User'
import { Upvote } from './Upvote'

@ObjectType() // graphql stuff
@Entity() // db table
export class Post extends BaseEntity {
  @Field(_type => ID) // graphql stuff
  // @PrimaryKey() // column in db table, mikroORM style
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  // @Property({ type: 'text' }) // column, mikroORM style
  @Column()
  title!: string

  @Field()
  @Column()
  text!: string

  @Field()
  @Column({ default: 0 }) // upvotes
  points!: number

  @Field({ nullable: true })
  @Column()
  userId: number

  @Field() // grab real user when resolver for this runs,
  // you can do find(..., {relations: ['user']})
  // or setup FieldResolver for this Post type like I already did
  @ManyToOne(() => User, user => user.posts)
  user: User

  @OneToMany(_to => Upvote, upvote => upvote.post)
  upvotes: Upvote[]

  @Field(() => Int)
  voteStatus!: number

  @Field()
  // @Property() // mikroORM style
  @CreateDateColumn({ type: 'timestamptz' })
  // createdAt: Date = new Date() // no need when using typeORM
  createdAt: Date

  @Field()
  // @Property({ onUpdate: () => new Date() }) // mikroORM style
  @UpdateDateColumn({ type: 'timestamptz' })
  // updatedAt: Date = new Date() // no need when using typeORM
  updatedAt: Date
}
