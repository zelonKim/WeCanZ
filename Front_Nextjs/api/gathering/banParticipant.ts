import { client } from "@/api/client";

export const banParticipant = async (participantId: string) => {
  const { data } = await client.patch(`/participant/${participantId}/ban`);
  return data;
};
