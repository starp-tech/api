import {
	getByKeyAndValues,
	dbFunction,
	pipeDBRequest
} from './util'

export const getFolderContent = async (env:Env, dbFunc:dbFunction, folderId: string) =>
  getByKeyAndValues(env, dbFunc,'folderId', [folderId]);

export const getFoldersByType = async (env:Env, dbFunc:dbFunction, folderType: string) =>
  getByKeyAndValues(env, dbFunc,'folderType', [folderType]);

export const processFolderRequest = async (
		request: Request,
		env: Env
) => {
  const u = new URL(request.url)
  const folderId = u.searchParams.get("folderId")
  const folderType = u.searchParams.get("folderType")
  
  if(folderType) 
  	return getFoldersByType(env, pipeDBRequest, folderType)
  
  if(folderId) 
  	return getFolderContent(env, pipeDBRequest, folderId)
  
}