import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GameNight API",
      version: "1.0.0",
      description:
        "REST API for organizing board game nights with friends. Supports authentication, event management, game proposals, and voting.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "access_token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            location: { type: "string" },
            maxParticipants: { type: "integer", nullable: true },
            status: {
              type: "string",
              enum: ["PLANNED", "CONFIRMED", "CANCELLED", "COMPLETED"],
            },
            hostId: { type: "string", format: "uuid" },
            winningGameId: { type: "string", format: "uuid", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        GameProposal: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            eventId: { type: "string", format: "uuid" },
            proposedById: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Events", description: "Event management endpoints" },
      { name: "Games", description: "Game proposals and voting" },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.routes.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
