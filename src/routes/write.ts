import {
	writeItem,
	createScope,
	createCollection,
	createPrimaryIndex
} from '../db'

import {
	getCookieData
} from '../auth'

import {
	v4 as uuid
} from 'uuid'

export const processWrite = async (
	request: Request,
	env: Env
) => {
	try {
		const body = await request.json()

		if(!body)
			throw "invalid_body"

		body.id = uuid()

		const auth = (await getCookieData({request, env}))

		const scope = auth.user_id
		
		if(!scope || !scope.length)
			return new Response({error:"invalid_scope"})

		console.info('processWrite scope', scope)
		
		try {
			const first = await writeItem(
				env, 
				scope, 
				scope, 
				body
			)
			console.info('first response', JSON.stringify(first))
			
			if(first.error)
				throw first.error

			return new Response(JSON.stringify(first))
		} catch(err) {
			console.error('first write failed', err.message)
		}
		
		try {
			const cr = await (await createScope(env, scope)).json()
			console.info("cr", JSON.stringify(cr))
		} catch(err) {
			console.error('cr failed', err.message)
		}
		
		try {
			const cc = await (await createCollection(env, scope, scope)).json()
			console.info("cc", JSON.stringify(cc))
		} catch(err) {
			console.error('cc failed', err.message)
		}

		try {
			const cp = await createPrimaryIndex(env, scope, scope)
			console.info("cp", JSON.stringify(cp))
		} catch(err) {
			console.error('cp failed', err.message)
		}

		const second = await writeItem(env, scope, scope, body)
		return new Response(JSON.stringify(second))

	} catch(err) {
		console.error("second write error", JSON.stringify(err))
		return new Response(JSON.stringify({error:err.message}))
	}
}