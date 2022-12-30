import {
	processToken,
	firebaseApp,
	firebaseConfig,
	COOKIE_NAME,
	getTokenData,
	parseCookie
} from './auth'

import {
	setUpSocket
} from './socket'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

	  if (request.headers.get("Upgrade") === "websocket") {
	  	return setUpSocket(request, env)
	  }

		const res = await parseCookie({request, env}) 
			|| await processToken({request, env})

		return res
	
	}
};
