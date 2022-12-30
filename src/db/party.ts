import {
	pipeDBRequest,
	getDBRequest
} from './util' 

export const pipeInstantPartyData = async (request, env) => {
  const u = new URL(request.url)
  const partyId = u.searchParams.get("partyId")
  const sql = `
	  ( 
	  	select * from _default as sync
	  	where messageType = 'party_media_sync'
	  	and chatId = $1 
	  	order by createdAt desc limit 1
	  )
	  UNION
  	(
	  	select * from _default as party join _default as media 
		  on party.id = media.chatId where media.messageType = 'party_media'
		  and party.partyId = $1 order by media.createdAt desc limit 1
	  )
  `
  const args = [partyId]
  return pipeDBRequest(env, sql, args)
}