import crypto from "node:crypto";
import prisma from "../utils/prisma.js";
import createError from "../utils/createError.js";

const ALLOWED_STATUSES = ["open", "in_progress", "closed"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// Generate a readable 6-character uppercase alphanumeric ID (e.g. 9F4B21)
const generateTicketId = () =>
  crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * POST /tickets
 */
export const createTicket = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return next(
        createError(400, "Title is required and must be a non-empty string"),
      );
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return next(
        createError(
          400,
          `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`,
        ),
      );
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return next(
        createError(
          400,
          `Invalid priority. Allowed values: ${ALLOWED_PRIORITIES.join(", ")}`,
        ),
      );
    }

    // Ensure generated ID is unique
    let id = generateTicketId();
    let collision = await prisma.ticket.findUnique({ where: { id } });
    while (collision) {
      id = generateTicketId();
      collision = await prisma.ticket.findUnique({ where: { id } });
    }

    const ticket = await prisma.ticket.create({
      data: {
        id,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "open",
        priority: priority || "medium",
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(createError(error.status || 500, error.message));
  }
};

/**
 * GET /tickets/stats
 */
export const getTicketStats = async (req, res, next) => {
  try {
    const grouped = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    const stats = {
      open: 0,
      in_progress: 0,
      closed: 0,
      total: 0,
    };

    for (const item of grouped) {
      stats[item.status] = item._count._all;
      stats.total += item._count._all;
    }

    res.status(200).json(stats);
  } catch (error) {
    next(createError(error.status || 500, error.message));
  }
};

/**
 * GET /tickets
 */
export const getTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 10),
    );
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return next(
          createError(
            400,
            `Invalid status filter. Allowed values: ${ALLOWED_STATUSES.join(", ")}`,
          ),
        );
      }
      where.status = status;
    }

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(createError(error.status || 500, error.message));
  }
};

/**
 * PATCH /tickets/:id
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    if (status === undefined && priority === undefined) {
      return next(
        createError(
          400,
          "At least status or priority must be provided for update",
        ),
      );
    }

    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return next(
        createError(
          400,
          `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`,
        ),
      );
    }

    if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority)) {
      return next(
        createError(
          400,
          `Invalid priority. Allowed values: ${ALLOWED_PRIORITIES.join(", ")}`,
        ),
      );
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return next(createError(404, `Ticket with ID ${id} not found`));
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
      },
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    next(createError(error.status || 500, error.message));
  }
};

/**
 * DELETE /tickets/:id
 */
export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return next(createError(404, `Ticket with ID ${id} not found`));
    }

    await prisma.ticket.delete({
      where: { id },
    });

    res.status(200).json({ message: "Ticket deleted successfully", id });
  } catch (error) {
    next(createError(error.status || 500, error.message));
  }
};

