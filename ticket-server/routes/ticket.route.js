import { Router } from "express";
import {
  createTicket,
  getTicketStats,
  getTickets,
  updateTicket,
} from "../controllers/ticket.controller.js";

const router = Router();

router.get("/api/v1/ticketsstats", getTicketStats);
router.post("/api/v1/tickets", createTicket);
router.get("/api/v1/tickets", getTickets);
router.patch("/api/v1/tickets/:id", updateTicket);

export default router;
