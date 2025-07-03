import { FastMCP } from "fastmcp";

export type TransportType =
  | NonNullable<Parameters<typeof FastMCP.prototype.start>[0]>["transportType"]
  | "sse";
