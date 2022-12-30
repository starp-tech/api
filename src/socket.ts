import {
	getLastSequenceId
} from './db'

let env;

let sessions = [];

let lastTimestamp = 0;

let couch = null


export const setUpSocket = async (request, e) => {
  env = e
  
  if (request.headers.get("Upgrade") != "websocket") {
    return new Response("expected websocket", {status: 400});
  }

  let ip = request.headers.get("CF-Connecting-IP");

  let [client, server] = Object.values(new WebSocketPair());
  
  await handleSession(server, ip);

  return new Response(null, { status: 101, webSocket: client });
}

const handleMessage = async (session, msg) => {
  try {
    const data = JSON.parse(msg.data)
    console.info('handleMessage', session, data)
    session.partyId = data.partyId
    session.joinTime = new Date().valueOf()
    broadcast(data);
  } catch (err) {
    console.error('parse message errror', err.message)
  }
}

const handleSession = async(webSocket, ip) => {

  webSocket.accept();

  let session = {webSocket, blockedMessages: [], ip};
  sessions.push(session);
  let closeOrErrorHandler = evt => {
    session.quit = true;
    sessions = sessions.filter(member => member !== session);
    broadcast({quit: session.partyId});
  };
  webSocket.addEventListener("message", (msg)=>handleMessage(session, msg))
  webSocket.addEventListener("close", closeOrErrorHandler);
  webSocket.addEventListener("error", closeOrErrorHandler);
  
  createCouchConnection()
}

const broadcast = (message) => {
  console.info("broadcast message to "+sessions.length)
  sessions.map(session => {
      if(message.chatId === session.partyId 
        && new Date(message.createdAt).valueOf() > session.joinTime)
        session.webSocket.send(JSON.stringify(message))
    }
  );
}

const handleCouchError = (e) => {
  console.error("couch conn error", JSON.stringify(e), e)
  if(e.reason 
      === "WebSocket disconnected without sending Close frame.")
    createCouchConnection()    
}
const handleCouchClose = (e) => {
  console.error("couch conn close", JSON.stringify(e))
	createCouchConnection()
}

const handleCouchMessage = (msg) => {
  try {
    let message = {
        name:"sync",
        id:"sync",
        message:"update",
        server_update:true
    }
    if(msg.data && msg.data.length) {
      // console.log('couch message w data', msg.data)
      const ndata = JSON.parse(msg.data)[0]
      message = {
        ...message,
        ...ndata.doc,
        id:ndata.id
      }
      if(message.chatId.search("public") === -1)
        return
      // console.info('new message from couch', message)   
    }
    else {
      return;
    }
    
    broadcast(message)

  } catch(err) {
    console.error("couch message error", err.message)
  } 
}

const createCouchConnection = async () => {
  console.info("createServerConnection start")
  try {
    if(couch && couch.signal && couch.signal.abort)
      couch.signal.abort()

    const hash = env.PUBLIC_PARTY_AUTH
    const url = env.PUBLIC_FEED_PATH
    const resp = await fetch(url, {
      headers: {
        "Authorization":`Basic ${hash}`,
        "upgrade": 'websocket',
        "connection": 'Upgrade',
        "accept-encoding": "*"
      },
    });

    couch = resp.webSocket;

	  console.info("createServerConnection resp", resp)

    if (!couch) {
      throw new Error("server didn't accept WebSocket");
    }

    couch.accept();

    let since = await getLastSequenceId(env)
    
    console.info('createServerConnection since', since)

    const couchOpts = {
        "include_docs":true,
        "since":since+1,
        "descending":true
    }

    couch.send(JSON.stringify(couchOpts))
    couch.addEventListener('message', handleCouchMessage);
    couch.addEventListener("close", handleCouchError);
    couch.addEventListener("error", handleCouchError);

    console.info("createServerConnection success")

  } catch(err) {
    console.error("createServerConnection error", err.message)
  }
}