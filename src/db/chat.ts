import {
	pipeDBRequest,
	getDBRequest
} from './util'

export const pipeLastMessageByType = async (
	request, 
	env
) => {
  try {
    const u = new URL(request.url)
    const partyId = u.searchParams.get("partyId")
    const messageType = u.searchParams.get("messageType") || 'party_media'
    const sql = 
    	"select * from _default where messageType = $1 and chatId = $2 order by createdAt desc limit 1"
    const args = [messageType,partyId]
    return pipeDBRequest(env, sql, args)
  } catch(err) {
    console.error("fetch err", err)
    return new Response(JSON.stringify({message:err.message}))
  }
}
