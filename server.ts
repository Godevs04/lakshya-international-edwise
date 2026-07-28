import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { attachSupportSocket } from "./lib/socket/support-socket";
import { logger } from "./lib/logger";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "4000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer((req, res) => {
      // Let Socket.IO own its path; don't let Next return 404 first.
      if (req.url?.startsWith("/api/socketio")) {
        return;
      }
      const parsedUrl = parse(req.url!, true);
      void handle(req, res, parsedUrl);
    });

    attachSupportSocket(httpServer);

    httpServer.listen(port, hostname, () => {
      logger.info(`Ready on http://${hostname}:${port} (Next + Socket.IO)`);
    });
  })
  .catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
  });
