import express, { Request, Response } from "express";
import helmet from "helmet";

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
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://trusted-scripts.com"],
          objectSrc: ["'none'"],
        },
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

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

  app.get("/", (req: Request, res: Response) => {
    res.send("Dapp Back End");
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
