export type dbFunction = getDBRequest | fetchDB | pipeDBRequest

export const getLastSequenceId = async (env) => {
  const sql = "SELECT count(meta().id) FROM _default"
  const results = await getDBRequest(env, sql)
  return parseInt(results[0].$1, 10)
}

export const getByKeyAndValues = async (
	env: Env, 
	dbFunc: dbFunction, 
	key: string, 
	values: string[],
	dbName = "_default",
	extraParams = {}
) => dbFunc(
	env,
  `select * from ${dbName} where ${key} in [${values
    .map((i, index) => '$'+(index+1))
    .join(',')}]`,
 	values,
 	dbName,
 	extraParams
);

export const getDBRequest = async (
  env, 
  sql, 
  args = [],
	dbName,
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
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
        "query_context":"default:starpy2"+(dbName? "."+dbName : ""),
	      ...extraParams
      })
    }
  const response = await fetch(url, params)
  return (await response.json()).results
}

export const fetchDB = async (
  env, 
  sql, 
  args = [],
	dbName = "_default",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
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
        "query_context":"default:starpy2."+dbName,
	      ...extraParams
      })
    }
  return fetch(url, params)
}

export const pipeDBRequest = async (
	env, 
	sql, 
	args = [],
	dbName = "_default",
  extraParams = {},
) => {
  let url = env.QUERY_SERVICE_URL
  let hash = env.PUBLIC_PARTY_AUTH
  const query_context = "default:starpy2."+dbName
  const body = {
    "statement":sql,
    "pretty":true,
    args,
    "timeout":"2s",
    "scan_consistency":"not_bounded",
    query_context,
    ...extraParams
  }
  // console.info('body',body)
  const params = {
    url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  }

  const response = await fetch(url, params)
  let { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}