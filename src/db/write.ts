import {
	getDBRequest,
	fetchDB,
} from './util'
import {
	UserData
} from '../types'

import {
	generatePassword
} from '../auth'

export const createBucket = async (env:Env, user:UserData) => {
	const userId = user.user_id.toLowerCase()
	const url = env.BUCKETS_URL
  const hash = env.WRITE_USER_HASH
  const body = "name="+userId
  +"&bucketType=membase&storageBackend=couchstore"
  +"&autoCompactionDefined=false&evictionPolicy=valueOnly"
  +"&threadsNumber=3&replicaNumber=1&durabilityMinLevel=none"
  +"&compressionMode=passive&maxTTL=0&replicaIndex=0"
  +"&conflictResolutionType=seqno&ramQuotaMB=100&flushEnabled=0"
  const params = {
		url,
    method:"POST",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/x-www-form-urlencoded"
    },
	  "body":body
	}
	// console.info('createBucket', JSON.stringify(params))
	return fetch(url, params)
}

export const createSyncGatewayUser = async (
	env:Env, 
	user:UserData, 
	method:string
) => {
	const userId = user.user_id.toLowerCase()
	const password = await generatePassword(env, userId)
	const url = env.SYNC_GATEWAY_URL+userId
  const hash = env.WRITE_USER_HASH
  const bucketParams = {
  	"import_docs": "continuous",
    "enable_shared_bucket_access":true,  
    "name":userId,
    "bucket":userId,
    "num_index_replicas":0,
	  "guest": {
	    "disabled": true
	  },
    "revs_limit":20
  }
  const params = {
		url,
    method:"PUT",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
	  "body":JSON.stringify(bucketParams)
	}
	try {
		// console.info('sync gateway params', JSON.stringify(params))
		const db = await (await fetch(url, params)).json()
		// console.info('sync gateway response', JSON.stringify(db))
	} catch (err) {
		console.error('sync gateway db error', err.message)
	}
	const userParams = {
		url:url+"/_user/"+userId,
    method:"PUT",
    headers: {
      "Authorization":`Basic ${hash}`,
      "Content-Type":"application/json"
    },
	  "body":JSON.stringify({name:userId, password})
	}
	// console.info('sync gateway user params', JSON.stringify(userParams))
	return fetch(userParams.url, userParams)
}


export const createUser = async (env:Env, user:UserData) => {
	const userId = user.user_id.toLowerCase()
	const email = user.email
	const password = encodeURIComponent(
		await generatePassword(env, userId)
	)
	// console.info('password', password, userId)
  let url = env.USER_SERVICE_URL+userId
  let hash = env.WRITE_USER_HASH
  const role = encodeURIComponent(
  	"sync_gateway_app["+userId+":_default:_default]"
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
	const sql = 'CREATE SCOPE `'+scopeName.toLowerCase()+'`._default'
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
	const sql = 'CREATE COLLECTION `'+scopeName.toLowerCase()+'`._default._default'

	return fetchDB(env, sql, [], scopeName)
}

export const createPrimaryIndex = async (
	env:Env, 
	scopeName:string, 
	collectionName:string
) => {
	const sql = 
		"CREATE PRIMARY INDEX ON `default`:`"+scopeName.toLowerCase()+"`._default._default"
		
	return fetchDB(env, sql, [], scopeName)
}

export const writeItem = async (
	env:Env, 
	scopeName = "starpy2", 
	collectionName = "starpy2",
	data:any
) => {
  let url = env.SCOPE_SERVICE_URL
  	+scopeName.toLowerCase()
  	+"/scopes/_default/"
  	+"/collections/_default"
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
	// console.info('writeItem params', params)
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