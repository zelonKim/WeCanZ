import { CreateReportDto } from "@/types/user/CreateReportDto";
import { client } from "../client";

export const createReport = async (createReportPayload: CreateReportDto) => {
  const { data } = await client.post("/reports", createReportPayload);
  return data;
};
