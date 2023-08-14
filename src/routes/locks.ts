const cloudApiURL = "/oauth2/token";
const listLockURL = "/v3/lock/list";
const addPassCodeUrl = "/v3/keyboardPwd/add";
const listPassCodesUrl = "/v3/lock/listKeyboardPwd";
const cloudRegisterURL = "/v3/user/register";
const transferLockUrl = "/v3/lock/transfer";
const addCardUrl = "/v3/identityCard/add"
const listCardsUrl = "/v3/identityCard/list"
const contentType = "application/x-www-form-urlencoded";
const clearCardsUrl = "/v3/identityCard/clear"

export const cloudAuth = async (env: Env) => {
  const payload = { 
    client_id: env.TT_LOCK_API_ID,
    client_secret: env.TT_LOCK_API_SECRET,
    username: env.TT_LOCK_API_ADMIN_USER_NAME,
    password: env.TT_LOCK_API_ADMIN_USER_PASSWORD
  };
  const res = await fetch(env.TT_LOCK_API_URL+cloudApiURL, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `client_id=${payload.client_id}&client_secret=${
      payload.client_secret
    }&password=${payload.password}&username=${payload.username}`
  });
  const data = res.json();
  console.info("authData", data);

  return data;
};

const cloudRegister = async (env: Env) => {
  const data = {
    clientId: env.TT_LOCK_API_ID,
    clientSecret: env.TT_LOCK_API_SECRET,
    ...defaultUserCreds,
    date: new Date().valueOf()
  };
  const res = await fetch(env.TT_LOCK_API_URL+cloudRegisterURL, 
  {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${
      data.clientId}&clientSecret=${
      data.clientSecret}&username=${
        data.username}&password=${
          originalPassword}&date=${
            data.date
          }`
  });
  return res.text();
};

export const getLockList = async (
  request: Request,
  env: Env
) => {
  const auth = await cloudAuth(env)
  const res = await fetch(env.TT_LOCK_API_URL+listLockURL, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&pageNo=1&pageSize=20&date=${new Date().valueOf()}`
  });
  const data = await Promise.all((await res.json())
    .list.map(async (lock)=>{
      lock.keys = await listPassCodesForLock(lock.lockId, env) 
      lock.cards = await listCardsCodesForLock(lock.lockId, env) 
      return lock
    }))
  return new Response(JSON.stringify(data));
};

export const setNewKey = async (
  request: Request,
  env: Env
) => {
  const u = new URL(request.url)
  const lockId = u.searchParams.get("lockId")
  const passcode = u.searchParams.get("key")
  const start = u.searchParams.get("start")
  const end = u.searchParams.get("end")
  const newKey = await setLockPassForStartEndTime(
    env, lockId, passcode, start, end
  )
  return new Response(JSON.stringify(newKey))
}

export const setLockCard = async (
  request: Request, 
  env: Env
) => {
  const u = new URL(request.url)
  const lockId = u.searchParams.get("lockId")
  const card = u.searchParams.get("card")
  const start = u.searchParams.get("start")
  const end = u.searchParams.get("end")
  const name = u.searchParams.get("name")
  const newKey = await setLockCardForStartEndTime(
    env, lockId, card, start, end, name
  )
  return new Response(JSON.stringify(newKey))
}

export const clearLockCards = async (
  request: Request, 
  env: Env
) => {
  const u = new URL(request.url)
  const lockId = u.searchParams.get("lockId")
  const auth = await cloudAuth(env)
  console.info(
    "clearLockCards", 
    lockId, 
  );
  const res = await fetch(env.TT_LOCK_API_URL+clearCardsUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&date=${new Date().valueOf()}`
  });
  return new Response(JSON.stringify(await res.json()))
}

export const setLockPassForStartEndTime = async (
  env:Env,
  lockId:number, 
  passcode:number, 
  startDate:number,
  endDate:number
) => {
  const auth = await cloudAuth(env)
  console.info(
    "setLockForPass", 
    lockId, 
    passcode, 
    startDate, 
    endDate, 
    auth.access_token
  );
  const res = await fetch(env.TT_LOCK_API_URL+addPassCodeUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&keyboardPwd=${
      passcode}&startDate=${
        startDate}&addType=2&endDate=${
          endDate}&date=${new Date().valueOf()}`
  });
  const data = await res.json();
  return data;
};

export const setLockCardForStartEndTime = async (
  env:Env,
  lockId:number, 
  cardId:number, 
  startDate:number,
  endDate:number,
  cardName:string
) => {
  const auth = await cloudAuth(env)
  console.info(
    "setLockCardForStartEndTime", 
    lockId, 
    cardId, 
    startDate, 
    endDate, 
    auth.access_token
  );
  const res = await fetch(env.TT_LOCK_API_URL+addCardUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&cardNumber=${cardId}&startDate=${
        startDate}&cardName=${cardName}&addType=2&endDate=${
          endDate}&date=${new Date().valueOf()}`
  });
  const data = await res.json();
  return data;
};

const listPassCodesForLock = async (lockId:number, env:Env) => {
  const auth = await cloudAuth(env);
  const res = await fetch(env.TT_LOCK_API_URL+listPassCodesUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&pageSize=100&pageNo=1&date=${new Date().valueOf()}`
  });
  const data = await res.json();
  return data;
};

const listCardsCodesForLock = async (lockId:number, env:Env) => {
  const auth = await cloudAuth(env);
  const res = await fetch(env.TT_LOCK_API_URL+listCardsUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&pageSize=100&pageNo=1&date=${new Date().valueOf()}`
  });
  const data = await res.json();
  return data;
};

const transferLock = async (env:Env, lockId, email) => {
  const auth = JSON.parse(await cloudAuth());
  const res = await fetch(env.TT_LOCK_API_URL+transferLockUrl, {
    method: "post",
    headers: { "Content-Type": contentType },
    body: `clientId=${env.TT_LOCK_API_ID}&accessToken=${
      auth.access_token
    }&lockId=${lockId}&receiverUsername=${
      email}&lockIdList=[${lockId}]&date=${new Date().valueOf()}`
  });
  const data = await res.json();
  return data;
};
