import { User } from '../models/User';
import { Task } from '../models/Task';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  static async getAllUsers() {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate task stats per user for rich admin insights
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$assignedUser',
          assignedCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = new Map<string, { assignedCount: number; completedCount: number }>();
    taskStats.forEach((stat) => {
      if (stat._id) {
        statsMap.set(stat._id.toString(), {
          assignedCount: stat.assignedCount,
          completedCount: stat.completedCount,
        });
      }
    });

    return users.map((u) => {
      const stats = statsMap.get(u._id.toString()) || { assignedCount: 0, completedCount: 0 };
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        assignedTasksCount: stats.assignedCount,
        completedTasksCount: stats.completedCount,
      };
    });
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
