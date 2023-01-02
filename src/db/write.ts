import {
	getDBRequest,
	fetchDB,
} from './util'
import {
	UserData
} from '../types'

export const hashFunc = (strings, salt, password) => {
	const index = {salt, password, "_":"_", "@":"@"}
	return JSON.parse(strings).reduce((a, i)=>{
		return a + "_" + index[i]
	}, "")
}

export const generatePassword = async (
	env:Env, 
	str:string
) => {
  // const encoder = new TextEncoder();
  const salt = env.USER_PASSWORD_SALT
  const text = hashFunc(env.HASH_TEMPLATE, salt, str)
  // console.info('generateSignedString text', text)
	const t = new TextEncoder().encode(text);
	const myDigest = await crypto.subtle.digest(
	  {
	    name: env.HASH_ALGO,
	  },
	  t
	);

  return btoa(
  	String.fromCharCode(...new Uint8Array(myDigest))
	);
}

export const createUser = async (env:Env, user:UserData) => {
	const userId = user.user_id
	const email = user.email
	const password = encodeURIComponent(
		await generatePassword(env, userId)
	)
	// console.info('password', password, userId)
  let url = env.USER_SERVICE_URL+userId
  let hash = env.WRITE_USER_HASH
  const role = encodeURIComponent(
  	"sync_gateway_app[starpy2:"+userId+":"+userId+"]"
  )
  const body = 
  	"roles="+role+"&name=&groups=&password="+password
  
  const params = {
		url,
    method:"PUT",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/x-www-form-urlencoded"
    },
	  "body":body,
	}
	return (await (await fetch(url, params)).json())
} 

export const createScope = async (env:Env, scopeName:string) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
  env.PUBLIC_PARTY_AUTH = hash
	const sql = 'CREATE SCOPE `starpy2`.`'+scopeName+'`'
	return fetchDB(env, sql, [], scopeName)
}

export const createCollection = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
  env.PUBLIC_PARTY_AUTH = hash
	const sql = 
		'CREATE COLLECTION `starpy2`.`'
		+scopeName+'`.`'+collectionName+'`'

	return fetchDB(env, sql, [], scopeName)
}

export const createPrimaryIndex = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
	const sql = 
		"CREATE PRIMARY INDEX ON `default`:`starpy2`.`"
		+scopeName+"`.`"+collectionName+"`"
		
	return fetchDB(env, sql, [], scopeName)
}

export const writeItem = async (
	env:Env, 
	scopeName = "_default", 
	collectionName = "_default",
	data:any
) => {
  let url = env.SCOPE_SERVICE_URL
  	+"/"+scopeName
  	+"/collections/"
  	+collectionName
  	+"/docs/"+data.id

  let hash = env.WRITE_USER_HASH
  const params = {
		url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/x-www-form-urlencoded"
    },
	  "body": "flags=33554438&value="+encodeURIComponent(JSON.stringify(data)),
	}
	console.info('writeItem params', params)
	return (await (await fetch(url, params)).json())
}

export const listScopes = async (env:Env) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
	return fetch({
		url,
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    }
	})
}