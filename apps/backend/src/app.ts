import Fastify, { FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { config } from "@cher-journal/config";
import { logger } from "@cher-journal/utils";
import path from "path";
import fs from "fs";

// Import all routes
import { authRoutes } from "./modules/auth/auth.routes";
import { adminChaptersRoutes } from "./modules/admin/chapters/chapters.routes";
import { adminVolumesRoutes } from "./modules/admin/volumes/volumes.routes";
import { adminAssetsRoutes } from "./modules/admin/assets/assets.routes";
import { adminPagesRoutes } from "./modules/admin/pages/pages.routes";
import { adminUsersRoutes } from "./modules/admin/users/users.routes";
import { adminOrdersRoutes } from "./modules/admin/orders/orders.routes";
import { refundsRoutes } from "./modules/admin/orders/refunds.routes";
import { schedulingRoutes } from "./modules/admin/scheduling/scheduling.routes";
import { adminDashboardRoutes } from "./modules/admin/dashboard/dashboard.routes";
import { adminSettingsRoutes } from "./modules/admin/settings/settings.routes";
import { promotionsRoutes } from "./modules/admin/promotions/promotions.routes";
import { priceHistoryRoutes } from "./modules/admin/prices/price-history.routes";
import { priceSchemaRoutes } from "./modules/admin/price-schemas/price-schemas.routes";
import { adminAuditRoutes } from "./modules/admin/audit/audit.routes";
import { adminConfigRoutes } from "./modules/admin/config/config.routes";
import { contentConfigRoutes } from "./modules/admin/content-config/content-config.routes";
import assetTagsRoutes from "./modules/admin/asset-tags/asset-tags.routes";
import { bundlesRoutes } from "./modules/admin/bundles/bundles.routes";
import { adminReviewsRoutes } from "./modules/admin/reviews/reviews.routes";
import { adminSupportRoutes } from "./modules/admin/support/support.routes";
import { adminChapterMuseRoutes } from "./modules/admin/chapter-muse/chapter-muse.routes";
import { libraryRoutes } from "./modules/reader/library/library.routes";
import { catalogRoutes } from "./modules/reader/catalog/catalog.routes";
import { waitRoutes } from "./modules/reader/wait/wait.routes";
import { readerRoutes } from "./modules/reader/reader/reader.routes";
import { activityRoutes } from "./modules/reader/activity/activity.routes";
import { pricingRoutes } from "./modules/reader/pricing/pricing.routes";
import { reviewsRoutes } from "./modules/reader/reviews/reviews.routes";
import { promotionsRoutes as userPromotionsRoutes } from "./modules/reader/promotions/promotions.routes";
import { readerOrdersRoutes } from "./modules/reader/orders/orders.routes";
import { readerSubscriptionsRoutes } from "./modules/reader/subscriptions/subscriptions.routes";
import { readerNotificationRoutes } from "./modules/reader/notifications/notifications.routes";
import { readerSupportRoutes } from "./modules/reader/support/support.routes";
import { stripeRoutes } from "./modules/stripe/stripe.routes";
import { customStoriesRoutes } from "./modules/custom-stories/custom-stories.routes";
import { registerPublicChaptersRoutes } from "./modules/public/chapters.routes.js";
import { sitemapService } from "./modules/public/sitemap.service.js";

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.isDev,
    bodyLimit: config.maxUploadSize,
    trustProxy: true,
  });

  // Ensure upload directory exists
  const uploadDir = path.resolve(config.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Register plugins
  await app.register(fastifyHelmet, {
    // Désactive les politiques d'isolement pour autoriser l'embed cross-origin des images
    contentSecurityPolicy: config.isDev ? false : undefined,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(fastifyCors, {
    origin: config.isDev ? true : config.corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-App'],
  });

  await app.register(fastifyCookie, {
    secret: config.sessionSecret,
  });

  await app.register(fastifyRateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: config.maxUploadSize,
    },
  });

  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: "/uploads/",
    decorateReply: false,
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "*");
    },
  });

  // CORS très permissif uniquement pour les assets statiques (/uploads)
  app.options("/uploads/*", async (_request, reply) => {
    reply
      .header("Access-Control-Allow-Origin", "*")
      .header("Access-Control-Allow-Methods", "GET, OPTIONS")
      .header("Access-Control-Allow-Headers", "*")
      .status(204)
      .send();
  });

  app.addHook("onRequest", async (request, reply) => {
    if (request.url.startsWith("/uploads/")) {
      reply.header("Access-Control-Allow-Origin", "*");
      reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
      reply.header("Access-Control-Allow-Headers", "*");
    }
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    logger.error("Request error", {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
    });

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.validation,
          ...(config.isDev && { stack: error.stack }),
        },
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: config.isDev ? error.message : "Internal server error",
        ...(config.isDev && { stack: error.stack }),
      },
    });
  });

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register routes with and without /api prefix
  const registerRoutes = (instance: FastifyInstance, routes: any[]) => {
    routes.forEach((route) => {
      instance.register(route);
    });
  };

  const allRoutes = [
    authRoutes,
    libraryRoutes,
    catalogRoutes,
    waitRoutes,
    readerRoutes,
    activityRoutes,
    pricingRoutes,
    reviewsRoutes,
    userPromotionsRoutes,
    readerOrdersRoutes,
    readerSubscriptionsRoutes,
    readerNotificationRoutes,
    readerSupportRoutes,
    customStoriesRoutes,
    stripeRoutes,
    adminChaptersRoutes,
    adminVolumesRoutes,
    adminAssetsRoutes,
    assetTagsRoutes,
    adminPagesRoutes,
    adminUsersRoutes,
    adminReviewsRoutes,
    adminSupportRoutes,
    adminOrdersRoutes,
    refundsRoutes,
    schedulingRoutes,
    adminDashboardRoutes,
    adminSettingsRoutes,
    adminAuditRoutes,
    adminConfigRoutes,
    contentConfigRoutes,
    bundlesRoutes,
    promotionsRoutes,
    priceHistoryRoutes,
    priceSchemaRoutes,
    adminChapterMuseRoutes,
  ];

  // Register other routes without /api prefix
  // Note: /uploads/* is already handled by fastifyStatic plugin above
  registerRoutes(app, allRoutes);

  // Register with /api prefix
  await app.register(
    async (apiInstance) => {
      registerRoutes(apiInstance, allRoutes);
    },
    { prefix: "/api" }
  );

  // Register public routes
  await registerPublicChaptersRoutes(app);

  // GET /sitemap.xml - Public sitemap for search engines
  app.get("/sitemap.xml", async (request, reply) => {
    try {
      const baseUrl = process.env.PUBLIC_BASE_URL || "https://moncherjournal.com";
      const sitemap = await sitemapService.generateSitemap(baseUrl);

      // Cache for 24 hours
      reply.header("Content-Type", "application/xml");
      reply.header("Cache-Control", "public, max-age=86400");

      return reply.send(sitemap);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: "Failed to generate sitemap" });
    }
  });

  // GET /robots.txt - Search engine crawler rules
  app.get("/robots.txt", async (request, reply) => {
    try {
      const robotsPath = path.join(path.dirname(__dirname), "public", "robots.txt");
      const robotsContent = fs.readFileSync(robotsPath, "utf-8");

      reply.header("Content-Type", "text/plain");
      reply.header("Cache-Control", "public, max-age=604800"); // Cache for 7 days

      return reply.send(robotsContent);
    } catch (error) {
      app.log.error(error);
      return reply.status(404).send("Not Found");
    }
  });

  return app;
}
