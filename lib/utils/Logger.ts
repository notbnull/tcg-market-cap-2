/* eslint-disable import/no-anonymous-default-export */
import { createLogger, format, transports } from "winston";

class Logger {
  private logger;

  public constructor() {
    this.logger = createLogger({
      level: "info", // Default log level
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
      ),
      transports: [new transports.Console()],
    });
  }

  public info(message: string) {
    this.logger.info(message);
  }

  public warn(message: string) {
    this.logger.warn(message);
  }

  public error(message: string) {
    this.logger.error(message);
  }

  public debug(message: string) {
    this.logger.debug(message);
  }
}

export default new Logger();
