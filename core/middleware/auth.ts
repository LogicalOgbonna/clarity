import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  if (!decoded) {
    return res.status(401).json({message: 'Unauthorized'});
  }
  res.locals.user = decoded;
  next();
};