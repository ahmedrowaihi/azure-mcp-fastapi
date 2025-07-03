import type { Profile } from "azure-devops-node-api/interfaces/ProfileInterfaces";

export function formatUserProfile(profile: Profile): Partial<Profile> | null {
  if (!profile) return null;
  return {
    id: profile?.id,
    timeStamp: profile?.timeStamp,
    coreAttributes: profile?.coreAttributes,
    applicationContainer: profile?.applicationContainer,
    revision: profile?.revision,
  };
}
