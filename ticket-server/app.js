import express from "express";
import cors from "cors";

import ticketRouter from "./routes/ticket.route.js";
import createError from "./utils/createError.js";

const app = express();

// CORS
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable("x-powered-by");

// API Routes
app.use(ticketRouter);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(createError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage =
    err.message || "Technical Error! We can't process your request at the moment";

  return res.status(errorStatus).json({
    status: errorStatus,
    message: errorMessage,
  });
});

export default app;
