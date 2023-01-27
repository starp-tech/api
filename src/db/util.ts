import {
  Env
} from '../types'
export type dbFunction = typeof getDBRequest | typeof fetchDB | typeof pipeDBRequest

export const getLastSequenceId = async (env:Env) => {
  const sql = "SELECT count(meta().id) FROM _default"
  const results = await getDBRequest(env, sql,[])
  return parseInt(results[0].$1, 10)
}

export const getByKeyAndValues = async (
	env: Env, 
	dbFunc: dbFunction, 
	key: string, 
	values: string[],
	dbName = "starpy2",
	extraParams = {}
) => dbFunc(
	env,
  `select * from _default where ${key} in [${values
    .map((i, index) => '$'+(index+1))
    .join(',')}]`,
 	values,
 	dbName,
 	extraParams
);

export const getDBRequest = async (
	env: Env, 
  sql: string,
	args = [] as (string | number)[],
	dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
  const query_context = "default:"+dbName.toLowerCase()+"._default"
  const params = {
      url,
      method:"POST",
      headers: {
        "Authorization":`Basic ${hash}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        "statement":sql,
        "pretty":true,
        args,
        "timeout":"2s",
        "scan_consistency":"not_bounded",
        query_context,
	      ...extraParams
      })
    }
  const response = await fetch(url, params)
  return ((await response.json()) as any).results
}

export const fetchDB = async (
  env: Env, 
  sql: String,
	args = [] as (string | number)[],
	dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
  const query_context = "default:"+dbName.toLowerCase()+"._default"
  const params = {
      url,
      method:"POST",
      headers: {
        "Authorization":`Basic ${hash}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        "statement":sql,
        "pretty":true,
        args,
        "timeout":"2s",
        "scan_consistency":"not_bounded",
        query_context,
	      ...extraParams
      })
    }
  return fetch(url, params)
}

export const pipeDBRequest = async (
	env: Env, 
	sql: String, 
	args = [] as (string | number)[],
  dbName = "starpy2",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
  const query_context = "default:"+dbName.toLowerCase()+"._default"
  const body = {
    "statement":sql,
    "pretty":true,
    args,
    "timeout":"2s",
    "scan_consistency":"not_bounded",
    query_context,
    ...extraParams
  }
  console.info('body',body)
  const params = {
    url,
    cf: {
      cacheTtlByStatus: { '200-299': 6, '404': 1, '500-599': 0 },
      cacheEverything:true
    },
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  }

  const response = await fetch(url, params)
  let { readable, writable } = new TransformStream();
  response.body?.pipeTo(writable);
  return new Response(readable, response);
}