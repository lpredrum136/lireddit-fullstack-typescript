import { Field, InterfaceType } from 'type-graphql'

@InterfaceType()
export abstract class IMutationResponse {
  @Field()
  code: number

  @Field()
  success: boolean

  @Field({ nullable: true })
  message?: string // when it's nullable true, should be "message?: ..."
}
