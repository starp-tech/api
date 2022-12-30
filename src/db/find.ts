import {
  getByKeyAndValues,
  dbFunction,
  getById,
} from './util'

export const findByOriginalId = async (env:Env, dbFunc:dbFunction, originalId) =>
  getByKeyAndValues(env, dbFunc, 'originalId', [originalId]);

export const processFindRequest = async (
		request: Request,
		env: Env
) => {
  const u = new URL(request.url)
  const originalId = u.searchParams.get("originalId")
  const id = u.searchParams.get("id")
  
  if(id) 
  	return getById(env, pipeDBRequest, id)
  
  if(folderId) 
  	return findByOriginalId(env, pipeDBRequest, originalId)
  
}