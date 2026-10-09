/** Reads a variable the tasks need; setup:qr sets each one in Trigger.dev. */
export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set in Trigger.dev.`);
  return value;
}
