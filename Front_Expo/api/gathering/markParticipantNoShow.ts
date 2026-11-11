import { client } from "@/api/client";


export const markParticipantNoShow = async (participantId: string) => {
  const { data } = await client.patch(`/participant/${participantId}/no-show`);
  return data;
};