import {
	pipeInstantPartyData,
	processFolderRequest,
	processFindRequest,
	processWrite,
	setUpSocket,
	processPartyRequest
} from './routes'

import {
	getCookieData,
	processToken
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

	  if (request.url.search("party") > -1) {
	  	return processPartyRequest(request, env)
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
			new Response(JSON.stringify(cookieRes)) : 
			await processToken({request, env});

		return res
	
	}
};
