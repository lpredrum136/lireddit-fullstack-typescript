import mongoose from 'mongoose'
import { prop, getModelForClass } from '@typegoose/typegoose'

export class Token {
  _id!: mongoose.Types.ObjectId

  @prop({ required: true })
  userId!: string

  @prop({ required: true })
  token!: string

  @prop({ default: Date.now, expires: 60 * 5 })
  // expire in 5 minutes, i.e. auto delete from mongodb, typegoose doesn't even have this in their documentation, shame!
  createdAt: Date
}

export const TokenModel = getModelForClass(Token)
