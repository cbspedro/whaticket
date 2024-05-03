import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import Company from "../models/Company";
import moment from "moment";
import { useDate } from "../utils/useDate";
interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}
const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const { returnDays } = useDate();
  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
  const [, token] = authHeader.split(" ");
  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;
    const company = await Company.findByPk(companyId);
    req.user = { id, profile, companyId };
  } catch (err) {
    if (err.statusCode === 401) {
      throw new AppError(err.message, 401);
    } else {
      throw new AppError(
        "Invalid token. We'll try to assign a new one on next request",
        403
      );
    }
  }
  return next();
};
export default isAuth;
