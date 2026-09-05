import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication required. Invalid token format.' });
      return;
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      res.status(401).json({ message: 'Authentication failed. Token is invalid or expired.' });
      return;
    }

    const user = await User.findById(payload.id);
    if (!user) {
      res.status(401).json({ message: 'User associated with this token no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
