import mongoose from 'mongoose';
import { Activity } from '../models/Activity';

export class ActivityService {
  static async log(
    userId: string | mongoose.Types.ObjectId,
    action: 'CREATED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'UPDATED' | 'DELETED',
    message: string,
    taskId?: string | mongoose.Types.ObjectId | null
  ) {
    try {
      await Activity.create({
        user: userId,
        task: taskId || null,
        action,
        message,
      });
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }
  }

  static async getRecentActivities(limit = 25) {
    return Activity.find()
      .populate('user', 'name email role')
      .populate('task', 'title status priority')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
