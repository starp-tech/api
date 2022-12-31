import {
	writeItem,
	createScope,
	createCollection
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

		const body = JSON.parse(request.body)
					body.id = uuid()

		const auth = (await getCookieData({request, env}))

		const scope = auth.user_id
		
		if(!scope || !scope.length)
			return new Response({error:"invalid_scope"})

		const firstWrite = await writeItem(
			env, 
			scope, 
			scope, 
			data
		)

	} catch(err) {
		console.error("processWrite error", err.message)
		return new Response({error:err.message})
	}
}