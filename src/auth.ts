import * as jose from 'jose'
const pubKeyUrl = 
	"https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

export const COOKIE_NAME = '__peerAuthToken';

const getCookie = (cookieString, key) => {
  if (cookieString) {
    const allCookies = cookieString.split("; ")
    const targetCookie = allCookies.find(cookie => cookie.includes(key))
    if (targetCookie) {
      const [_, value] = targetCookie.split("=")
      return value
    }
  }
  return null
}

export const parseCookie = async ({request, env}) => {
	const cookieString = request.headers.get("Cookie")
	const authToken = getCookie(cookieString, COOKIE_NAME)
	if(authToken) {
		const data = await getTokenData(authToken)
		if(data.payload)
			return new Response(
				JSON.stringify(
					{
						...(data.payload), 
						fromCookie:true
					}
				)
			)
		else return null
	}
}

export const getTokenData = async (authToken) => {
	const json = await (await fetch(pubKeyUrl)).json()
	// console.info('tokens json', json, authToken)
	const pubKeys = Object.keys(json).map(j=>json[j])
	// console.info('start validateToken', pubKeys)
	const algo = 'RS256'

	return ((await Promise.all(
		pubKeys.map(async (key)=>{
			// console.info('map pubkey', key)
			const cryptoKey = await jose.importX509(key, algo)
			// console.info('cryptoKey', JSON.stringify(cryptoKey))
			try {
				const res = await jose.jwtVerify(
					authToken, 
					cryptoKey,
					{
						issuer: "https://securetoken.google.com/starpy",
					}
				)
				return res
			} catch {
				return {}
			}
		}
	))).find(i=>i.payload) || {})
}

const validateToken = async (authToken:string) => {
	try {
		const isValid = await getTokenData(authToken)
		console.info(isValid)
		return isValid.payload
	} catch(err) {
		console.error('validateToken error', err)
		throw err.message
	}
}

export const processToken = async ({request, env}) => {
	const invalidTokenError = JSON.stringify({error:"Token Invalid"})
	try {
    let u = new URL(request.url)
    let authToken = u.searchParams.get("authToken")
    
    if(!authToken 
    	|| typeof authToken !== "string"
    	|| authToken.length < 5) {
    	return new Response("Token Invalid")
    }

		const payload = await validateToken(authToken)
		
		if(payload){
	  	const res = new Response(JSON.stringify(payload))
      const newCookie = `${COOKIE_NAME}=${authToken}; path=/; secure; HttpOnly; SameSite=Strict`
      res.headers.set("Set-Cookie", newCookie)
      return res;
		}
	  else 
	  	return new Response(invalidTokenError)

	} catch(err) {
		console.error("validate token error", err)
  	return new Response(invalidTokenError)
	}
}
