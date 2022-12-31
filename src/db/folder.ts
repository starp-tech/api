import {
	getByKeyAndValues,
	dbFunction
} from './util'

export const getFolderContent = async (
	env:Env, 
	dbFunc:dbFunction, 
	folderId: string,
	dbName: string,
	extraParams = {}
) =>
  getByKeyAndValues(env, dbFunc,'folderId', [folderId], dbName, extraParams);

export const getFoldersByType = async (
	env:Env, 
	dbFunc:dbFunction, 
	folderType: string,
	dbName: string,
	extraParams = {}
) =>
  getByKeyAndValues(env, dbFunc,'folderType', [folderType], dbName, extraParams);
