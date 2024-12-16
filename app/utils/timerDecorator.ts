/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "./Logger";

export function Timer(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    const result = await originalMethod.apply(this, args);
    const duration = Date.now() - start;

    logger.info(`Execution time for ${propertyKey}: ${duration}ms`);
    return result;
  };

  return descriptor;
}
