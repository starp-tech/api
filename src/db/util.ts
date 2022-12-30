export const getDBRequest = async (
  env, 
  sql, 
  args = []
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
        "query_context":"default:starpy2._default"
      })
    }
  const response = await fetch(url, params)
  return (await response.json()).results
}

export const fetchDB = async (
  env, 
  sql, 
  args = []
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
        "query_context":"default:starpy2._default"
      })
    }
  return fetch(url, params)
}

export const pipeDBRequest = async (
	env, 
	sql, 
	args = []
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
      "query_context":"default:starpy2._default"
    })
  }

  const response = await fetch(url, params)
  let { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}