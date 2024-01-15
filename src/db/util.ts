import { Env } from "../types";
export type dbFunction =
  | typeof getDBRequest
  | typeof fetchDB
  | typeof pipeDBRequest;

export const getLastSequenceId = async (env: Env) => {
  const sql = "SELECT count(meta().id) FROM _default";
  const results = await getDBRequest(env, sql, []);
  return parseInt(results[0].$1, 10);
};

export const getByKeyAndValues = async (
  env: Env,
  dbFunc: dbFunction,
  key: string,
  values: string[],
  dbName = "starpy2",
  extraParams = {},
) =>
  dbFunc(
    env,
    `select * from _default where ${key} in [${values
      .map((i, index) => "$" + (index + 1))
      .join(",")}]`,
    values,
    dbName,
    extraParams,
  );

export const getDBRequest = async (
  env: Env,
  sql: string,
  args = [] as (string | number)[],
  dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL;
  let hash = env.PUBLIC_PARTY_AUTH;
  const query_context = "default:" + dbName.toLowerCase() + "._default";
  const params = {
    url,
    method: "POST",
    headers: {
      Authorization: `Basic ${hash}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statement: sql,
      pretty: true,
      args,
      timeout: "2s",
      scan_consistency: "not_bounded",
      query_context,
      ...extraParams,
    }),
  };
  const response = await fetch(url, params);
  return ((await response.json()) as any).results;
};

export const fetchDB = async (
  env: Env,
  sql: String,
  args = [] as (string | number)[],
  dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL;
  let hash = env.PUBLIC_PARTY_AUTH;
  const query_context = "default:" + dbName.toLowerCase() + "._default";
  const params = {
    url,
    method: "POST",
    headers: {
      Authorization: `Basic ${hash}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statement: sql,
      pretty: true,
      args,
      timeout: "2s",
      scan_consistency: "not_bounded",
      query_context,
      ...extraParams,
    }),
  };
  return fetch(url, params);
};

export const pipeDBRequest = async (
  env: Env,
  sql: String,
  args = [] as (string | number)[],
  dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL;
  let hash = env.PUBLIC_PARTY_AUTH;
  const query_context = "default:" + dbName.toLowerCase() + "._default";
  const body = {
    statement: sql,
    pretty: true,
    args,
    timeout: "2s",
    scan_consistency: "not_bounded",
    query_context,
    ...extraParams,
  };
  console.info("body", body, sql);
  const params = {
    url,
    cf: {
      cacheEverything: false,
    },
    method: "POST",
    headers: {
      Authorization: `Basic ${hash}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(url, params);
  const accessHost = "http://localhost:8080"
  let { readable, writable } = new TransformStream();
  response.body?.pipeTo(writable);
  // const headers = new Headers()
  // headers.set(access,"http://localhost:8080")
  // response.headers.entries()
  console.info('response headers', JSON.stringify([...response.headers.entries()]))
  const newResponse = new Response(readable);

  const corsHeaders = {
    "Access-Control-Allow-Origin": accessHost,
    "Access-Control-Allow-Credentials":"true",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Origin":accessHost,
    "x-workers-hello":JSON.stringify([...response.headers.entries()])
  };

  (Object.keys(corsHeaders) as (keyof typeof corsHeaders)[]).map((key)=>{
    newResponse.headers.delete(key)
    newResponse.headers.set(key, corsHeaders[key])
    return key
  })
  console.info('headers for pipe 1', JSON.stringify([...newResponse.headers.entries()]))
  return newResponse;
};
