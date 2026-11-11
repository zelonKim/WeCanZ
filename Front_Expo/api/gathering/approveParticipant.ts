import { client } from "@/api/client";

export const approveParticipant = async (participantId: string) => {
  const { data } = await client.patch(`/participant/${participantId}/approve`);
  return data;
};
