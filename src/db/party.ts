import {
	pipeDBRequest,
	getDBRequest
} from './util' 

export const pipeInstantPartyData = async (request, env) => {
  const u = new URL(request.url)
  const partyId = u.searchParams.get("partyId")
  const sql = `
	  select * from (select * from _default as party join _default as msg 
	  on party.id = msg.chatId where msg.messageType in ['party_media'] 
	  and party.partyId = $1 order by msg.createdAt desc limit 1) as partyMedia
  `
  const args = [partyId]
  return pipeDBRequest(env, sql, args)
}