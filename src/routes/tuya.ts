const tuya = require("@tuya/tuya-connector-nodejs")

const getTuyaLocks = async (env:Env) => {
	const TuyaContext = tuya.TuyaContext
	const context = new TuyaContext({
		baseUrl: env.TUYA_API_URL,
		accessKey: env.TUYA_API_KEY,
		secretKey: env.TUYA_API_SECRETE,
	});
	const device_id = "bf95f0yvuyadanlz";
  const devicedetail  = await context.device.detail({
    device_id: device_id,
  });
	const data = await context.request({
	  method: 'GET',
	  path: '/v1.3/iot-03/devices',
	});
	console.info("data", data.result, devicedetail)
	return data
}

getTuyaLocks()