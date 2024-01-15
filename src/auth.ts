import * as jose from "jose";
import { Env } from "./types";
import { decodeProtectedHeader, jwtVerify } from "jose";
import { importX509 } from "jose";
import { decode } from "jose/dist/types/util/base64url";
const pubKeyUrl =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const googleAccessTokenURL = "https://www.googleapis.com/oauth2/v1/userinfo?access_token="
const identityToolkitURL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key="
export const COOKIE_NAME = "authToken";

const getCookie = (cookieString: string, key: string) => {
  if (cookieString) {
    const allCookies = cookieString.split("; ");
    const targetCookie = allCookies.find((cookie) => cookie.includes(key));
    if (targetCookie) {
      const [_, value] = targetCookie.split("=");
      return value;
    }
  }
  return null;
};

export const getCookieData = async ({ request, env }) => {
  const cookieString = request.headers.get("Cookie");
  const authToken = getCookie(cookieString, COOKIE_NAME);

  if (!authToken) return null;
  console.info('=get cookie data=')
  const data = await getTokenData(authToken);

  if (data.payload)
    return {
      ...data.payload as jose.JWTPayload,
      id: data.payload.user_id,
      isUserData: true,
      fromCookie: true,
      name: data.payload.email,
    };
};

export const getTokenData = async (authToken: string)  => {
  const json = (await (await fetch(pubKeyUrl)).json()) as any;
  // console.info('tokens json', json, authToken)
  const pubKeys = Object.keys(json).map((j) => json[j]);
  // console.info('start validateToken', pubKeys)
  const algo = "RS256";

  return (
    (
      await Promise.all(
        pubKeys.map(async (key) => {
          // console.info('map pubkey', key)
          const cryptoKey = await jose.importX509(key, algo);
          // console.info('cryptoKey', JSON.stringify(cryptoKey))
          try {
            const res = await jose.jwtVerify(authToken, cryptoKey, {
              issuer: "https://securetoken.google.com/starpy",
            });
            return {
              ...res, 
              payload:{
                ...res.payload, 
                id: res.payload.user_id,
                name: res.payload.email,
                user_id:res.payload.user_id,
                email:res.payload.email
              }
            };
          } catch {
            return {payload:undefined};
          }
        }),
      )
    ).find((i) => i.payload) || { payload: undefined }
  );
};

const validateToken = async (authToken: string) => {
  try {
    const isValid = await getTokenData(authToken);
    console.info("isValid", isValid);
    return isValid.payload;
  } catch (err) {
    console.error("validateToken error", err);
    throw (err as Error).message;
  }
};

export const processToken = async ({ request, env }) => {
  const invalidTokenError = JSON.stringify({ error: "Token Invalid" });
  const cookieString = request.headers.get("Cookie");
  try {
    let u = new URL(request.url);
    let authToken = u.searchParams.get("authToken") || getCookie(cookieString, COOKIE_NAME);;

    if (!authToken || typeof authToken !== "string" || authToken.length < 5) {
      return new Response('{"error":"Token Invalid"}');
    }

    const payload = await validateToken(authToken);
    // console.info('token has payload', payload)
    if (payload) {
      const expiresInDays = 10;
      const newCookie = `${COOKIE_NAME}=${authToken}; SameSite=None; Secure; Expires=${new Date().setDate(new Date().getDate() + expiresInDays).valueOf()}`;
      const headers = new Headers()
      headers.set("Set-Cookie", newCookie);
      headers.set('Access-Control-Allow-Origin', "http://localhost:8080")
      console.info('headers', headers)
      const res = new Response(JSON.stringify(payload), {headers});
      // console.info('setCookie', newCookie)

    const accessHost = "http://localhost:8080"
    const corsHeaders = {
      "Access-Control-Allow-Origin": accessHost,
      "Access-Control-Allow-Credentials":"true",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
      "Origin":accessHost,
      "x-workers-hello":"hello"
    };

    (Object.keys(corsHeaders) as (keyof typeof corsHeaders)[]).map((key)=>{
      res.headers.delete(key)
      res.headers.set(key, corsHeaders[key])
      return key
    })
      return res;
    } else return new Response(invalidTokenError);
  } catch (err) {
    console.error("validate token error", err);
    return new Response(invalidTokenError);
  }
};

export const hashFunc = (strings: string, salt: string, password: string) => {
  const index = { salt, password, _: "_", "@": "@" };
  return JSON.parse(strings).reduce((a: string, i: string) => {
    return (a + "_" + index[i]) as string;
  }, "");
};

export const generatePassword = async (env: Env, str: string) => {
  // const encoder = new TextEncoder();
  const salt = env.USER_PASSWORD_SALT;
  const text = hashFunc(env.HASH_TEMPLATE, salt, str.toLowerCase());
  // console.info('generateSignedString text', text)
  const t = new TextEncoder().encode(text);
  const myDigest = await crypto.subtle.digest(
    {
      name: env.HASH_ALGO,
    },
    t,
  );

  return btoa(String.fromCharCode(...new Uint8Array(myDigest))).replace(
    /[^\w\s]/gi,
    "",
  );
};
export const verifyGoogleLogin = async ({ request, env })  => {
  let u = new URL(request.url);
  let googleToken = u.searchParams.get("googleToken")
  try {
    let decoded = await (await fetch(identityToolkitURL+env.GOOGLE_API_KEY,{
      method:"POST",
      body:JSON.stringify({
        "postBody":`access_token=${googleToken}&providerId=google.com`,
        "requestUri":"https://starpy.me",
        "returnIdpCredential":true,
        "returnSecureToken":true
      })
    })).json()
    console.info('decoded', JSON.stringify(decoded))
    const expiresInDays = 10;
    const newCookie = `${COOKIE_NAME}=${decoded.idToken}; SameSite=None; Secure; Expires=${new Date().setDate(new Date().getDate() + expiresInDays).valueOf()}`;
    const headers = new Headers()
    headers.set("Set-Cookie", newCookie);
    return new Response(JSON.stringify(decoded), {headers})
  } catch(err) {
    console.error('verifyGoogleLogin error', err)
    return new Response(`'{"error":"${err.message}"}'`)
  }
}