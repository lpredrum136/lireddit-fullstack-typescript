import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType() // graphql stuff
@Entity() // db table
export class User {
  @Field(_type => ID) // graphql stuff
  @PrimaryKey() // column in db table
  id!: number

  @Field()
  @Property()
  createdAt: Date = new Date()

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Field()
  @Property({ type: 'text', unique: true }) // column
  username!: string

  // No @Field() to prevent this from being exposed to graphql
  @Property({ type: 'text' }) // column
  password!: string
}
