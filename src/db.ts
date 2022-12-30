export const getLastSequenceId = async (env) => {
	const sql = "SELECT count(meta().id) FROM _default"
	const results = getDBRequest(env, sql)
  return parseInt(results[0].$1, 10)
}

export const getDBRequest = async (env, sql, args = []) => {
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

export const pipeLastMessageByType = async (
	request, 
	env
) => {
  try {
    const u = new URL(request.url)
    const partyId = u.searchParams.get("partyId")
    let hash = env.PUBLIC_PARTY_AUTH
    const messageType = u.searchParams.get("messageType") || 'party_media'
    const sql = 
    	"select * from _default where messageType = $1 and chatId = $2 order by createdAt desc limit 1"
    const args = [messageType,partyId]
    const response = await fetch(url, params)
    return pipeDBRequest(env, sql, args)
  } catch(err) {
    console.error("fetch err", err)
    return new Response(JSON.stringify({message:err.message}))
  }
}
