import {
	getFoldersByType,
	getFolderContent,
	pipeDBRequest
} from "../db"
import {
	getCookieData
} from '../auth'
import {
	Env
} from '../types'

export const processFolderRequest = async (
		request: Request,
		env: Env
) => {
  const u = new URL(request.url)
  const folderId = u.searchParams.get("folderId")
  const folderType = u.searchParams.get("folderType")
	const auth = (await getCookieData({request, env}))
	const scope = auth ? auth.user_id : undefined;
	console.info('get folder for scope', scope)
  if(folderType) 
  	return getFoldersByType(env, pipeDBRequest, folderType, 
  		scope
  	)
  
  if(folderId) 
  	return getFolderContent(env, pipeDBRequest, folderId, 
  		scope
  	)
  
}