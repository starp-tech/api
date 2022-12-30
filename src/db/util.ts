
export type dbFunction = getDBRequest | fetchDB | pipeDBRequest

export const getByIds = async (
	env: Env, 
	dbFunc: dbFunction, 
	ids: string[],
	dbName: string,
	extraParams = {}
) => getByKeyAndValues(env, dbFunc, 'id', ids, dbName, extraParams);

export const getById = async (
	env: Env, 
	dbFunc: dbFunction, 
	id: string,
	dbName: string,
	extraParams = {}
) => getByIds(env, dbFunc, [id], dbName, extraParams)

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
  console.info('body',body)
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