import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity() // db table
export class Post {
  @PrimaryKey() // column
  id!: number

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property({ type: 'text' }) // column
  title!: string
}
