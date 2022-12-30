import {
	processToken,
	firebaseApp,
	firebaseConfig,
	COOKIE_NAME,
	getTokenData,
	parseCookie,
} from './auth'

import {
	setUpSocket
} from './socket'

import {
	pipeInstantPartyData,
	processFolderRequest,
	processFindRequest
} from './db'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {

	  if (request.headers.get("Upgrade") === "websocket") {
	  	return setUpSocket(request, env)
	  }

	  if (request.url.search("party-one") > -1) {
	  	return pipeInstantPartyData(request, env)
	  }

	  if (request.url.search("find") > -1) {
	  	return processFindRequest(request, env)
	  }

	  if (request.url.search("folder") > -1) {
	  	return processFolderRequest(request, env)
	  }

		const res = await parseCookie({request, env}) 
			|| await processToken({request, env})

		return res
	
	}
};
