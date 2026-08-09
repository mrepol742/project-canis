import fs from "fs";
import path from "path";
import { IncomingMessage, ServerResponse } from "http";
import { PROJECT_CANIS_ALIAS } from "./config";

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
) => void | Promise<void>;

type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};

const webRoot = path.join(__dirname, "components", "web");
const landingPagePath = path.join(webRoot, "index.html");
const upPagePath = path.join(webRoot, "up", "index.html");

const startedAt = new Date();

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(body, null, 2));
}

function sendHtmlFile(res: ServerResponse, filePath: string) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      sendJson(res, 500, {
        ok: false,
        error: "Failed to load page",
      });
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });
}

function notFound(res: ServerResponse, pathname: string) {
  sendJson(res, 404, {
    ok: false,
    error: "Route not found",
    path: pathname,
  });
}

const routes: RouteDefinition[] = [
  {
    method: "GET",
    path: "/",
    handler(_req, res) {
      sendHtmlFile(res, landingPagePath);
    },
  },
  {
    method: "GET",
    path: "/up",
    handler(_req, res) {
      sendHtmlFile(res, upPagePath);
    },
  },
];

export async function handleRoute(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const method = req.method ?? "GET";
  const host = req.headers.host ?? "127.0.0.1";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const pathname = url.pathname;

  const route = routes.find(
    (entry) => entry.method === method && entry.path === pathname,
  );

  if (!route) {
    notFound(res, pathname);
    return;
  }

  await route.handler(req, res, url);
}
