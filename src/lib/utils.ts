import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkImageExists(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });
    return (
      response.ok && response.headers.get("content-type")?.startsWith("image/")
    );
  } catch (error) {
    console.warn(`Image check failed for ${url}:`, error);
    return false;
  }
}
