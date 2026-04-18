export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logError } = await import("@/lib/error-log");

    process.on("unhandledRejection", (reason) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      logError({
        level: "error",
        source: "unhandledRejection",
        message: err.message,
        stack: err.stack,
      }).catch(() => {});
    });

    process.on("uncaughtException", (err) => {
      logError({
        level: "error",
        source: "uncaughtException",
        message: err.message,
        stack: err.stack,
      }).catch(() => {});
    });
  }
}
