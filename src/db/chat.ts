import { Env } from "../types";
import { pipeDBRequest } from "./util";

export const pipeLastMessageByType = async (request: Request, env: Env) => {
  try {
    const u = new URL(request.url);
    const partyId = u.searchParams.get("chatId");
    const messageType = u.searchParams.get("messageType") || "party_media";
    const sql =
      "select * from _default where messageType = $1 and chatId = $2 order by createdAt desc limit 1";
    const args = [messageType, partyId] as string[];
    return pipeDBRequest(env, sql, args);
  } catch (err) {
    console.error("fetch err", err);
    return new Response(JSON.stringify({ message: (err as Error).message }));
  }
};

export const pipeMessagesForParty = async (request: Request, env: Env) => {
  try {
    console.info("pipeMessagesForParty");
    const u = new URL(request.url);
    const partyId = u.searchParams.get("chatId");
    const limit = u.searchParams.get("limit") || "20";
    const sql =
      "select * from _default where chatId = $1 order by createdAt desc limit $2";
    const args = [partyId, parseInt(limit)] as (string | number)[];
    return pipeDBRequest(env, sql, args);
  } catch (err) {
    console.error("fetch err", err);
    return new Response(JSON.stringify({ message: (err as Error).message }));
  }
};
