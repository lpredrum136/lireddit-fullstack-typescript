import { Field, ObjectType } from 'type-graphql'
import { Post } from './Post'

@ObjectType()
export class PaginatedPosts {
  @Field()
  totalCount: number

  @Field(_type => Date, { nullable: true })
  cursor: Date | null // I think cursor?: Date is ok as well

  @Field()
  hasMore!: boolean

  @Field(_type => [Post])
  paginatedPosts!: Post[]
}
