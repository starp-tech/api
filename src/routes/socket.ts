import { Env } from "../types";
let env: Env;

let sessions = [] as any[];

let lastTimestamp = 0;

let couch: any = null;

export const setUpSocket = async (request: Request, e: Env) => {
  env = e;

  if (request.headers.get("Upgrade") != "websocket") {
    return new Response("expected websocket", { status: 400 });
  }

  let ip = request.headers.get("CF-Connecting-IP");

  let [client, server] = Object.values(new WebSocketPair());

  await handleSession(server, ip as string);

  return new Response(null, { status: 101, webSocket: client });
};

const handleMessage = async (session: any, msg: any) => {
  try {
    const data = JSON.parse(msg.data);
    console.info("handleMessage", session, data);
    session.partyId = data.partyId;
    session.joinTime = new Date().valueOf();
    broadcast(data);
  } catch (err) {
    console.error("parse message errror", (err as Error).message);
  }
};

const handleSession = async (webSocket: WebSocket, ip: string) => {
  webSocket.accept();

  let session = {
    webSocket,
    blockedMessages: [],
    ip,
    partyId: "",
    joinTime: 0,
    quit: false,
  };

  sessions.push(session);
  let closeOrErrorHandler = (evt: any) => {
    session.quit = true;
    sessions = sessions.filter((member) => member !== session);
    broadcast({ quit: session.partyId });
  };
  webSocket.addEventListener("message", (msg) => handleMessage(session, msg));
  webSocket.addEventListener("close", closeOrErrorHandler);
  webSocket.addEventListener("error", closeOrErrorHandler);

  createCouchConnection();
};

const broadcast = (message: any) => {
  console.info("broadcast message to " + sessions.length);
  try {
    sessions.map((session) => {
      try {
        if (
          message.chatId === session.partyId &&
          new Date(message.createdAt).valueOf() > session.joinTime
        )
          session.webSocket.send(JSON.stringify(message));
      } catch (err) {
        console.error("broadcast single error", (err as Error).message);
      }
    });
  } catch (err) {
    console.error("broadcast all error", (err as Error).message);
  }
};

const handleCouchError = (e: any) => {
  console.error("couch conn error", JSON.stringify(e), e);
  if (e.reason === "WebSocket disconnected without sending Close frame.")
    createCouchConnection();
};
const handleCouchClose = (e: any) => {
  console.error("couch conn close", JSON.stringify(e));
  createCouchConnection();
};

const handleCouchMessage = (msg: any) => {
  try {
    console.info("couch msg data length", msg.data.length, msg.data);
    let message = {
      name: "sync",
      id: "sync",
      message: "update",
      chatId: "",
      server_update: true,
    };
    if (msg.data && msg.data.length) {
      // console.log('couch message w data', msg.data)
      const ndata = JSON.parse(msg.data)[0];
      message = {
        ...message,
        ...ndata.doc,
        id: ndata.id,
      };
      if (message.chatId.search("public") === -1) return;
      // console.info('new message from couch', message)
    } else {
      return;
    }

    broadcast(message);
  } catch (err) {
    console.error("couch message error", (err as Error).message);
  }
};

const createCouchConnection = async () => {
  console.info("createServerConnection start");
  try {
    if (couch && couch.signal && couch.signal.abort) couch.signal.abort();

    const hash = env.PUBLIC_PARTY_AUTH;
    const url = env.PUBLIC_FEED_PATH;
    const resp = await fetch(url + "?feed=websocket", {
      headers: {
        Authorization: `Basic ${hash}`,
        upgrade: "websocket",
        connection: "Upgrade",
        "accept-encoding": "*",
      },
    });

    couch = resp.webSocket;

    console.info("createServerConnection resp", JSON.stringify(resp));

    if (!couch) {
      throw new Error("server didn't accept WebSocket");
    }

    couch.accept();

    let since = (
      (await (
        await fetch(url, {
          headers: {
            Authorization: `Basic ${hash}`,
          },
        })
      ).json()) as any
    ).last_seq;

    console.info("createServerConnection since", since);

    const couchOpts = {
      include_docs: true,
      since: since,
      // "descending":true
    };

    couch.send(JSON.stringify(couchOpts));
    couch.addEventListener("message", handleCouchMessage);
    couch.addEventListener("close", handleCouchError);
    couch.addEventListener("error", handleCouchError);

    console.info("createServerConnection success");
  } catch (err) {
    console.error("createServerConnection error", (err as Error).message);
  }
};
