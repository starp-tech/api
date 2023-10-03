import * as jose from "jose";
import { Env } from "./types";
const pubKeyUrl =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

export const COOKIE_NAME = "__peerAuthToken";

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

  const data = await getTokenData(authToken);

  if (data.payload)
    return {
      ...data.payload,
      id: data.payload.user_id,
      isUserData: true,
      fromCookie: true,
      name: data.payload.email,
    };
};

export const getTokenData = async (authToken: string) => {
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
            console.info("jose jwtVerify res", res);
            return res;
          } catch {
            return {};
          }
        }),
      )
    ).find((i) => i.payload) || { payload: false }
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
  try {
    let u = new URL(request.url);
    let authToken = u.searchParams.get("authToken");

    if (!authToken || typeof authToken !== "string" || authToken.length < 5) {
      return new Response("Token Invalid");
    }

    const payload = await validateToken(authToken);

    if (payload) {
      const res = new Response(JSON.stringify(payload));
      const newCookie = `${COOKIE_NAME}=${authToken}; path=/; secure; HttpOnly; SameSite=Strict`;
      res.headers.set("Set-Cookie", newCookie);
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
