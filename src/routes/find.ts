import {
	getById,
	findByOriginalId,
	pipeDBRequest	
} from '../db'

export const processFindRequest = async (
	request: Request,
	env: Env
) => {
  const u = new URL(request.url)
  const originalId = u.searchParams.get("originalId")
  const id = u.searchParams.get("id")

  if(id) 
  	return getById(env, pipeDBRequest, id)
  
  if(originalId) 
  	return findByOriginalId(env, pipeDBRequest, originalId)
  
}