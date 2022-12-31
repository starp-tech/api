export const createScope = async (env:Env, scopeName:string) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
	return (await (await fetch({
		url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
	  "body": "name="+scopeName,
	})).json())
}

export const listScopes = async (env:Env) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
	return (await (await fetch({
		url,
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    }
	})).json())
}

export const createCollection = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
  let url = env.SCOPE_SERVICE_URL+"/"+scopeName+"/collections"
  let hash = env.WRITE_USER_HASH

	return (await (await fetch({
		url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
	  "body": "name="+collectionName,
	})).json())
}

export const writeItem = async (
	env:Env, 
	scopeName:string, 
	collectionName:string,
	data:any
) => {
  let url = env.SCOPE_SERVICE_URL
  	+"/"+scopeName
  	+"/collections/"
  	+collectionName
  	+"/docs/"
  	+"/"+data.id

  let hash = env.WRITE_USER_HASH

	return (await (await fetch({
		url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
	  "body": JSON.stringify({value:data}),
	})).json())
}