import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../utils/prisma.js";

describe("Ticket API Integration Tests", { timeout: 15000 }, () => {
  let createdTicketId;

  afterAll(async () => {
    // Clean up created test ticket
    if (createdTicketId) {
      await prisma.ticket.deleteMany({
        where: { id: createdTicketId },
      });
    }
    await prisma.$disconnect();
  });

  describe("POST /api/v1/tickets", () => {
    it("should successfully create a new ticket with valid inputs", async () => {
      const payload = {
        title: "Test Ticket for Vitest",
        description: "Checking take-home integration test setup",
        priority: "high",
      };

      const res = await request(app).post("/api/v1/tickets").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.id).toHaveLength(6);
      expect(res.body.title).toBe(payload.title);
      expect(res.body.description).toBe(payload.description);
      expect(res.body.priority).toBe("high");
      expect(res.body.status).toBe("open"); // Default status

      createdTicketId = res.body.id;
    });

    it("should return 400 Bad Request when title is missing", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .send({ description: "Missing title ticket" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/title is required/i);
    });

    it("should return 400 Bad Request when an invalid status is passed", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .send({ title: "Bad status", status: "invalid_status" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid status/i);
    });
  });

  describe("GET /api/v1/tickets/stats", () => {
    it("should return counts grouped by status", async () => {
      const res = await request(app).get("/api/v1/tickets/stats");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("open");
      expect(res.body).toHaveProperty("in_progress");
      expect(res.body).toHaveProperty("closed");
      expect(res.body).toHaveProperty("total");
      expect(typeof res.body.open).toBe("number");
      expect(typeof res.body.total).toBe("number");
    });
  });

  describe("GET /api/v1/tickets", () => {
    it("should return a list of tickets with pagination metadata", async () => {
      const res = await request(app).get("/api/v1/tickets?page=1&limit=5");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 5,
      });
    });

    it("should support filtering by status", async () => {
      const res = await request(app).get("/api/v1/tickets?status=open");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((ticket) => {
        expect(ticket.status).toBe("open");
      });
    });
  });

  describe("PATCH /api/v1/tickets/:id", () => {
    it("should update ticket status and priority", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${createdTicketId}`)
        .send({ status: "in_progress", priority: "low" });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdTicketId);
      expect(res.body.status).toBe("in_progress");
      expect(res.body.priority).toBe("low");
    });

    it("should return 404 Not Found for non-existent ticket ID", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/ZZZZZZ")
        .send({ status: "closed" });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
