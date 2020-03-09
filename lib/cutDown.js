/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-08 21:19:54
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 01:23:10
 */
async function canCutDown(options) {
	const { reqOpts, maxChunkLen } = options;
	let ctLength;
	let res;
	ctLength = await new Promise(resolve => {
		if (reqOpts.uri === undefined) return resolve("uri is undefined");
		res = request(reqOpts).on("response", async resp => {
			if (resp.headers["content-length"]) {
				ctLength = parseInt(resp.headers["content-length"]);
			} else {
				ctLength = 0;
			}
			await resolve(ctLength);
		});
	});
	if (res) {
		res.abort();
	}
	if (!ctLength) {
		return ctLength;
	} else if (ctLength > maxChunkLen) {
		const rgs = [];
		const num = parseInt(ctLength / maxChunkLen);
		const mod = parseInt(ctLength % maxChunkLen);
		for (let i = 0; i < num; i++) {
			const rg = {
				start: i === 0 ? i : i * maxChunkLen + 1,
				end: (i + 1) * maxChunkLen
			};
			rgs.push(rg);
		}

		if (mod > 0) {
			const rg = {
				start: num * maxChunkLen + 1,
				end: ctLength
			};
			rgs.push(rg);
		}
		rgs[rgs.length - 1].end = rgs[rgs.length - 1].end - 1;
		console.log(
			`the file is big, need to split it to ${rgs.length} pieces`
		);
		return { rgs, cut: true, szie: ctLength };
	} else {
		return { cut: false, reqOpts };
	}
	// 如果 pipe参数存在，则下载到指定路径
}

module.exports = canCutDown;
