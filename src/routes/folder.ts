
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