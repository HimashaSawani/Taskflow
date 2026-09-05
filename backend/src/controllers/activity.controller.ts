import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  static async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await ActivityService.getRecentActivities(30);
      res.status(200).json({ activities });
    } catch (error) {
      next(error);
    }
  }
}
