import { client } from "@/api/client";

export const PendingParticipant = async (participantId: string) => {
  const { data } = await client.patch(`/participant/${participantId}/pending`);
  return data;
};
