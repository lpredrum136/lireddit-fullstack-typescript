// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Entity } from 'typeorm'
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'
import { Post } from './Post'

@ObjectType() // graphql stuff
@Entity() // db table
export class User extends BaseEntity {
  @Field(_type => ID) // graphql stuff, by default, this means Graphql NOT NULL, going with the '!' icon on the field, if you want it to be nullable, do {nullable: true} and id?: number
  // @PrimaryKey() // column in db table, MikroORM style
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  // @Property({ type: 'text', unique: true }) // column // MikroORM style
  @Column({ unique: true })
  username!: string

  @Field()
  // @Property({ type: 'text', unique: true }) // column // MikroORM style
  @Column({ unique: true })
  email!: string

  // No @Field() to prevent this from being exposed to graphql
  // @Property({ type: 'text' }) // column // MikroORM style
  @Column()
  password!: string

  @OneToMany(() => Post, post => post.user)
  posts: Post[]

  @Field()
  // @Property() // MikroORM style
  @CreateDateColumn({ type: 'timestamptz' })
  // createdAt: Date = new Date() // no need to initialise when using typeorm
  createdAt: Date

  @Field()
  // @Property({ onUpdate: () => new Date() }) // MikroORM style
  @UpdateDateColumn({ type: 'timestamptz' })
  // updatedAt: Date = new Date() // no need when using typeorm
  updatedAt: Date
}
