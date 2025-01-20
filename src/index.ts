require("dotenv").config();

import { startHttpServer } from "http-server";
import { startWSServer } from "websocket-server";
import { scheduleCronOperations } from "cron-operations";

scheduleCronOperations();

const httpServer = startHttpServer();

startWSServer(httpServer);
