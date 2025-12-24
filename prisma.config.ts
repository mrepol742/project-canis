import dotenv from "dotenv";
dotenv.config({ quiet: true, debug: process.env.NODE_ENV === "production" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ?? "mysql://root@127.0.0.1:3306/project_canis",
  },
});
