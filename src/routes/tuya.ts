// const tuya = require("@tuya/tuya-connector-nodejs");

// const getTuyaLocks = async (env: Env) => {
//   const TuyaContext = tuya.TuyaContext;
//   const context = new TuyaContext({
//     baseUrl: env.TUYA_API_URL,
//     accessKey: env.TUYA_API_KEY,
//     secretKey: env.TUYA_API_SECRET,
//   });
//   const data = await context.request({
//     method: "GET",
//     path: "/v1.3/iot-03/devices",
//   });
//   console.info("data", data.result, devicedetail);
//   return data;
// };

