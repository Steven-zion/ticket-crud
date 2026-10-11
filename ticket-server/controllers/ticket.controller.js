import createError from "../utils/createError.js";

export const createTicket = (req, res, next) => {
  try {
  } catch (error) {
    next(createError(error.status, error.message));
  }
};