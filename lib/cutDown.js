/* eslint-disable no-return-await */
/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-08 21:19:54
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 21:51:30
 */
const request = require("request");
const { isFunction } = require("util");
const { getSpeedByBytes } = require("../utils/index");

async function canCutDown(options) {
	const { maxChunkLen, ...reqOpts } = options;
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

/**
 * 下载器
 * 
 * @param {Object} options 
 * @param {Function} callback 进度条返回数据 
 * @returns {
	completed: read,// 已读取
	total, //全部
	hiden, //完成后是否隐藏进度条
	time: { start }, //任务开始时间
	status: {
		down: '正在下载...', //下载时的文字
		end: '完成\n' //完成后的信息
	}
}
*/
function Get(options) {
	const { hiden, time, size, out, ...reqOpts } = options;
	const start = time !== undefined ? time.start : new Date().valueOf() / 1000;
	let read = options.read || 0;
	let response = 0;
	let total = 0;
	let speed;

	const res = request(reqOpts);
	const Interval = setInterval(() => {
		res.emit("progress", {
			completed: read,
			total,
			hiden,
			speed,
			time: { start },
			status: { down: "正在下载...", end: "完成\n" }
		});
		speed = 0;
	}, 1000);
	res.on("response", resp => {
		if (resp.headers["content-length"] || size) {
			response = size || parseInt(resp.headers["content-length"] || 0);
		}
	})
		.on("data", data => {
			read += data.length;
			speed = getSpeedByBytes(data.length);
			total =
				(size !== undefined || response === undefined) && size >= read
					? size
					: response || read + 1;
		})
		.on("end", () => {
			res.emit("progress", {
				completed: read,
				speed,
				total,
				hiden,
				time: { start },
				status: {
					down: "正在下载...",
					end: "完成\n"
				}
			});
			clearInterval(Interval);
		});
	// 如果 pipe参数存在，则下载到指定路径
	return res;
}
module.exports = { Get, canCutDown };
