import {
  writeItem,
  createScope,
  createCollection,
  createPrimaryIndex,
  createUser,
  createSyncGatewayUser,
  createBucket,
} from "../db";

import { Env } from "../types";

import { getCookieData } from "../auth";

import { v4 as uuid } from "uuid";

export const processPublicWrite = async (request: Request, env: Env) => {
  try {
    const body = await request.json();

    if (!body) throw "invalid_body";

    (body as any).id = uuid();

    const auth = await getCookieData({ request, env });

    const scope = auth.user_id;

    console.info("public write scope", scope);

    if (!scope || !scope.length)
      return new Response(JSON.stringify({ error: "invalid_scope" }));

    const first = await writeItem(env, "starpy2", "starpy2", body);
    return new Response(JSON.stringify(first));
  } catch (err) {
    console.error("public write error", (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }));
  }
};

export const processWrite = async (request: Request, env: Env) => {
  try {
    const body = await request.json();

    if (!body) throw "invalid_body";

    if (!(body as any).id) (body as any).id = uuid();

    const auth = await getCookieData({ request, env });

    const scope = auth.user_id;

    console.info("processWrite scope", scope);

    if (!scope || !scope.length)
      return new Response(JSON.stringify({ error: "invalid_scope" }));

    try {
      const first: any = await writeItem(env, scope, scope, body);
      console.info("first response", JSON.stringify(first));

      if (first.error) throw first.error;

      return new Response(JSON.stringify(first));
    } catch (err) {
      console.error(
        "first write failed",
        JSON.stringify((err as Error).message),
      );
    }
    try {
      const b = await await createBucket(env, auth);
      // console.info('b', JSON.stringify(b))
    } catch (err) {
      console.error("error creating bucket", err);
      // throw err.message
    }

    try {
      const cr = await await createScope(env, scope);
      // console.info("cr", JSON.stringify(cr))
    } catch (err) {
      console.error("cr failed", (err as Error).message);
    }

    try {
      const cc = await await createCollection(env, scope, scope);
      // console.info("cc", JSON.stringify(cc))
    } catch (err) {
      console.error("cc failed", (err as Error).message);
    }

    try {
      const cp = await createPrimaryIndex(env, scope, scope);
      // console.info("cp", JSON.stringify(cp))
    } catch (err) {
      console.error("cp failed", (err as Error).message);
    }
    try {
      const user = await createUser(env, auth);
      // console.info('user', JSON.stringify(user))
    } catch (err) {
      console.error("create user error", err);
    }
    try {
      // const user = await createUser(env, auth)
      const sync = await createSyncGatewayUser(env, auth);
      // console.info('sync user', JSON.stringify(sync))
    } catch (err) {
      console.error("create sync error", err);
    }

    const second = await writeItem(env, scope, scope, body);
    return new Response(JSON.stringify(second));
  } catch (err) {
    console.error("second write error", (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }));
  }
};
