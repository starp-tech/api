// import * from '@cloudflare/workers-types';
import {
	pipeInstantPartyData,
	processFolderRequest,
	processFindRequest,
	processWrite,
	setUpSocket,
	processPartyRequest,
	processPublicWrite,
	pipeMessagesForParty,
	getLockList,
	setNewKey
} from './routes'

import {
	getCookieData,
	processToken,
	generatePassword
} from './auth'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		try {

		  if (request.headers.get("Upgrade") === "websocket") {
		  	return setUpSocket(request, env)
		  }

		  if (request.url.search("findBy") > -1) {
		  	return processFindRequest(request, env)
		  }

		  if (request.url.search("messages") > -1) {
		  	// console.info('get messages')
		  	return pipeMessagesForParty(request, env)
		  }

		  if (request.url.search("folder") > -1) {
		  	return processFolderRequest(request, env)
		  }

		  if (request.url.search("writeItem") > -1) {
		  	return processWrite(request, env)
		  }

		  if(request.url.search("writePublicData") > -1) {
		  	return processPublicWrite(request, env);
		  }

		  if (request.url.search("party") > -1) {
		  	return processPartyRequest(request, env)
		  }

		  if (request.url.search("getlocklist") > -1) {
		  	return getLockList()
		  }

		  if (request.url.search("setlockkey") > -1) {
		  	return setNewKey(request, env)
		  }


		  const cookieRes = await getCookieData({request, env}) 

		  if (request.url.search("appLogin") > -1 && cookieRes) {
		  	const r = JSON.stringify({
		  		...cookieRes,
		  		password:await generatePassword(env, cookieRes.user_id)
		  	})
		  	return new Response(r);
		  }

			const res = cookieRes ? 
				new Response(JSON.stringify(cookieRes)) : 
				await processToken({request, env});

			return res
		} catch(err) {
			console.error('request error', err)
			return new Response(
				JSON.stringify({error:err.message})
			)
		}
	
	}
};
