
export type dbFunction = getDBRequest | fetchDB | pipeDBRequest

export const getByIds = async (
	env: Env, 
	dbFunc: dbFunction, 
	ids: string[]
) => getByKeyAndValues(env, dbFunc, 'id', ids);

export const getById = async (
	env: Env, 
	dbFunc: dbFunction, 
	id: string
) => {
  const [item] = await getByIds(env, dbFunc, [id]);
  return item || {};
};

export const getByKeyAndValues = async (
	env: Env, 
	dbFunc: dbFunction, 
	key: string, 
	values: string[]
) => dbFunc(
	env,
  `select * from _ where ${key} in [${values
    .map((i, index) => '$'+index)
    .join(',')}]`,
 	args
);

export const getDBRequest = async (
  env, 
  sql, 
  args = [],
  params = {}
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
        "query_context":"default:starpy2._default",
	      ...params
      })
    }
  const response = await fetch(url, params)
  return (await response.json()).results
}

export const fetchDB = async (
  env, 
  sql, 
  args = [],
  params = {}
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
        "query_context":"default:starpy2._default",
	      ...params
      })
    }
  return fetch(url, params)
}

export const pipeDBRequest = async (
	env, 
	sql, 
	args = [],
  params = {}
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
      "pretty":false,
      args,
      "timeout":"2s",
      "scan_consistency":"not_bounded",
      "query_context":"default:starpy2._default",
      ...params
    })
  }

  const response = await fetch(url, params)
  let { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}