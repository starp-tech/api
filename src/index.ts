import {
	pipeInstantPartyData,
	processFolderRequest,
	processFindRequest,
	processWrite,
	setUpSocket
} from './routes'

import {
	getCookieData
} from './auth'

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

	  if (request.url.search("findBy") > -1) {
	  	return processFindRequest(request, env)
	  }

	  if (request.url.search("folder") > -1) {
	  	return processFolderRequest(request, env)
	  }

	  if (request.url.search("writeItem") > -1) {
	  	return processWrite(request, env)
	  }

	  const cookieRes = await getCookieData({request, env}) 

		const res = cookieRes ? 
			new Response(cookieRes) : 
			await processToken({request, env});

		return res
	
	}
};
