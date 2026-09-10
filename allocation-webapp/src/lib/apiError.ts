import type { ApiError } from "../types";

export function errorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as ApiError).message === "string") {
    return (err as ApiError).message;
  }
  return fallback;
}
