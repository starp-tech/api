import {
	processToken,
	firebaseApp,
	firebaseConfig,
	COOKIE_NAME,
	getTokenData
} from './auth'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
    const cookieString = request.headers.get("Cookie")
    const authToken = getCookie(cookieString, COOKIE_NAME)
    if(authToken) {
    	const data = await getTokenData(authToken)
    	return new Response(JSON.stringify({...(data.payload), fromCookie:true}))
    }
		const res = await processToken({request, env})
		return res
	},
};


/**
 * Takes a cookie string
 * @param {String} cookieString - The cookie string value: "val=key; val2=key2; val3=key3;"
 * @param {String} key - The name of the cookie we are reading from the cookie string
 * @returns {(String|null)} Returns the value of the cookie OR null if nothing was found.
 */
function getCookie(cookieString, key) {
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