import {
	pipeDBRequest,
	getDBRequest
} from '../db' 

export const processPartyRequest = async (request, env) => {
  
  if (request.url.search("party-one") > -1) {
  	return pipeInstantPartyData(request, env)
  }
  if(request.url.search("party-media") > -1) {
  	return partyMediaList(request, env)
  }
  return partyList(request, env)

}

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

export const partyList = async (request, env) => {
  try {
    let url = env.PUBLIC_PARTY_VIEW_URL
    let hash = env.PUBLIC_PARTY_AUTH
    const params = {
        headers: {
          "Authorization":`Basic ${hash}`
        }
      }
    const data = await fetch(url, params)
    const json = JSON.stringify(await data.json())
    return new Response(json)
  } catch(err) {
    console.error("fetch err", err)
    return new Response(JSON.stringify({message:err.message}))
  }
}

export const partyMediaList = async (request, env) => {
  try {
    let u = new URL(request.url)
    let url = new URL(env.PARTY_MEDIA_URL)
    let hash = env.PUBLIC_PARTY_AUTH
    const params = {
        headers: {
          "Authorization":`Basic ${hash}`
        }
      }
    const partyId = u.searchParams.get("partyId")
    url.searchParams.set("key", partyId)
    const data = await fetch(url, params)
    const json = JSON.stringify(await data.json())
    return new Response(json)
  } catch(err) {
    console.error("fetch err", err)
    return new Response(JSON.stringify({message:err.message}))
  }
}
