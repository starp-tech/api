import {
	getDBRequest
} from './util'
export const createScope = async (env:Env, scopeName:string) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
  env.PUBLIC_PARTY_AUTH = hash
	const sql = 'CREATE SCOPE `starpy2`.'+scopeName
	return getDBRequest(env, sql, [], scopeName)
}

export const createCollection = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
  let url = env.SCOPE_SERVICE_URL
  let hash = env.WRITE_USER_HASH
  env.PUBLIC_PARTY_AUTH = hash
	const sql = 'CREATE COLLECTION `starpy2`.'+scopeName+"."+collectionName
	return getDBRequest(env, sql, [], scopeName)
}

export const createPrimaryIndex = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
	const sql = "CREATE PRIMARY INDEX ON `default`:`starpy2`."+scopeName+".`"+collectionName+"`"
	return getDBRequest(env, sql, [], scopeName)
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


// fetch("https://db-enc1.starpy.me/pools/default/buckets/starpy2/scopes/MWXMNu7xK7YK3ololoOJoU23PWI3/collections/media/docs/124rasfasf", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//     "cache-control": "no-cache",
//     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "invalid-auth-response": "on",
//     "ns-server-ui": "yes",
//     "pragma": "no-cache",
//     "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "cookie": "_ga=GA1.1.782769708.1672356656; _ga_TGXM40S8J8=GS1.1.1672448528.9.1.1672455976.0.0.0; ui-auth-db-enc1.starpy.me=6dfe5ed5b06a514334dec61f679199ea",
//     "Referer": "https://db-enc1.starpy.me/ui/index.html",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "flags=33554438&value=%7B%22click%22%3A%20%22to%20edit%22%2C%22with%20JSON%22%3A%20%22there%20are%20no%20reserved%20field%20names%22%7D",
//   "method": "POST"
// });