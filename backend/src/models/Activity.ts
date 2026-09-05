import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ITask } from './Task';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | IUser;
  task?: mongoose.Types.ObjectId | ITask | null;
  action: 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UPDATED' | 'DELETED';
  message: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    action: {
      type: String,
      enum: ['CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'UPDATED', 'DELETED'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
