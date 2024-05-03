import pino from "pino";
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      levelFirst: true,
      translateTime: "dd/mm/yyyy HH:MM:ss",
      colorize: true,
      ignore: "pid,hostname"
    }
  }
});
export { logger };
