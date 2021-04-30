// import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType() // graphql stuff
@Entity() // db table
export class Post extends BaseEntity {
  @Field(_type => ID) // graphql stuff
  // @PrimaryKey() // column in db table, mikroORM style
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  // @Property() // mikroORM style
  @CreateDateColumn()
  // createdAt: Date = new Date() // no need when using typeORM
  createdAt: Date

  @Field()
  // @Property({ onUpdate: () => new Date() }) // mikroORM style
  @UpdateDateColumn()
  // updatedAt: Date = new Date() // no need when using typeORM
  updatedAt: Date

  @Field()
  // @Property({ type: 'text' }) // column, mikroORM style
  @Column()
  title!: string
}
