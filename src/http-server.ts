import express, { Request, Response } from "express";

import * as ngrok from "@ngrok/ngrok";
import cors from "cors";
import cookieParser from "cookie-parser";

import ngrokConfig from "./config/ngrok";

import { PORT, whitelist, MAX_FILE_SIZE_BYTES, isProduction } from "const";
import router from "./routes";

import errorHandler from "./utils/errorHandler";
import { bytesToMB } from "helpers/sizeConvert";

export const startHttpServer = () => {
  const app = express();

  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        if (whitelist.indexOf(origin as string) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: `${bytesToMB(MAX_FILE_SIZE_BYTES)}mb` }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://trusted-scripts.com; object-src 'none';"
    );
    next();
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("Dapp Resonator Back End.");
  });

  app.use(router);

  app.use(errorHandler);

  const server = app.listen(PORT, async () => {
    console.log(`Server is listening on port ${PORT}`);

    if (isProduction) {
      try {
        const listener = await ngrok.forward(ngrokConfig);

        console.log("ngrok url", listener.url());
      } catch (error) {
        console.error("Error starting ngrok:", error);
      }
    }
  });

  return server;
};
