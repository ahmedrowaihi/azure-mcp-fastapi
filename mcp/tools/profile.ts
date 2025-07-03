import { z } from "zod";
import { formatUserProfile } from "@formatters/profile";
import type { ProfileService } from "@azure/services/profile";
import type { FastMCP } from "fastmcp";

export function registerProfileTools(
  server: FastMCP,
  profileService: ProfileService
) {
  server.addTool({
    name: "getUserProfile",
    description: "Get user profile by ID",
    parameters: z.object({ id: z.string() }),
    async execute(args) {
      const { id } = args;
      const profile = await profileService.getUserProfile(id);
      return JSON.stringify(formatUserProfile(profile));
    },
  });

  server.addTool({
    name: "getCurrentUserProfile",
    description:
      "Get the user that we are calling azure devops api on behalf of",
    async execute() {
      const profile = await profileService.getCurrentUserProfile();
      return JSON.stringify(formatUserProfile(profile));
    },
  });
}
