import { CreateReportDto } from "@/types/user/CreateReportDto";
import { client } from "../client";

export const createReport = async (dto: CreateReportDto) => {
  const { data } = await client.post("/reports", dto);
  return data;
};

