import {
	Env
} from '../types'

import {
  getByKeyAndValues,
  dbFunction
} from './util'

export const getByIds = async (
	env: Env, 
	dbFunc: dbFunction, 
	ids: string[],
	dbName: string,
	extraParams = {}
) => getByKeyAndValues(env, dbFunc, 'id', ids, dbName, extraParams);

export const getById = async (
	env: Env, 
	dbFunc: dbFunction, 
	id: string,
	dbName: string,
	extraParams = {}
) => getByIds(env, dbFunc, [id], dbName, extraParams)

export const findByOriginalId = async (
	env:Env, 
	dbFunc:dbFunction, 
	originalId:string,
	dbName: string,
	extraParams = {}
) =>
  getByKeyAndValues(env, dbFunc, 'originalId', [originalId], dbName, extraParams);
