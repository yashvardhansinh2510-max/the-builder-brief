import { Response } from "express";

export const errorResponse = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({ error: message });
};

export const successResponse = (res: Response, data: unknown) => {
  return res.json(data);
};

export const unauthorizedError = (res: Response) => {
  return errorResponse(res, 401, "Unauthorized");
};

export const notFoundError = (res: Response, resource: string) => {
  return errorResponse(res, 404, `${resource} not found`);
};

export const forbiddenError = (res: Response, message: string) => {
  return errorResponse(res, 403, message);
};

export const badRequestError = (res: Response, message: string) => {
  return errorResponse(res, 400, message);
};

export const serverError = (res: Response, message: string, err?: unknown) => {
  if (err) console.error(`[Error] ${message}:`, err);
  return errorResponse(res, 500, message);
};
