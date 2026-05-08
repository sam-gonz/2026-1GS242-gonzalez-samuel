import { Schema, model, Types } from 'mongoose'

export interface IMessage {
  transaction: Types.ObjectId
  sender:      Types.ObjectId
  text:        string
  readBy:      Types.ObjectId[]
  createdAt:   Date
}

const messageSchema = new Schema<IMessage>({
  transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
  sender:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:        { type: String, required: true, maxlength: 2000 },
  readBy:      [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export const Message = model<IMessage>('Message', messageSchema)
