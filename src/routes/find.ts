import { getById, findByOriginalId, pipeDBRequest } from "../db";
import { getCookieData } from "../auth";
import { Env } from "../types";
import { publicPartyPref } from "./party";


export const processFindRequest = async (request: Request, env: Env) => {
  const u = new URL(request.url);
  const originalId = u.searchParams.get("originalId");
  const id = u.searchParams.get("id");
  const auth = await getCookieData({request, env})
  const scope = auth ? auth.user_id : "starpy2";
  console.info('find scope', scope)
  if (id) return getById(env, pipeDBRequest, id, scope);

  if (originalId)
    return findByOriginalId(env, pipeDBRequest, originalId, scope);
};
