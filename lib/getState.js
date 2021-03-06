/* eslint-disable no-return-await */
/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-08 21:37:06
 * @last author: bubao
 * @last edit time: 2021-02-06 13:53:07
 */
const fs = require("fs");
const { promisify } = require("util");
const { Readable } = require("stream");
const { Get, canCutDown } = require("./cutDown");
const { merge, clearFileName } = require("../utils/index");
const path = require("path");
const mkdirp = require("mkdirp2");
const fsExists = promisify(fs.exists);
const fsStat = promisify(fs.stat);
const fsRealPath = promisify(fs.realpath);
const fsUnlink = promisify(fs.unlink);

let Upload_From_Break_Failed_State = {};
const baseReqOpts = {
	headers: {}
};
const compact = list => {
	if (!Array.isArray(list)) {
		return [];
	}
	const result = [];
	list.forEach(item => {
		if (item && item !== "") {
			result.push(item);
		}
	});
	return result;
};
/**
 * 检查续点上传的转态
 */
const Inspect_Upload_From_Break_Failed_State = () => {
	// 检查续点上传的分片不为空
	if (Upload_From_Break_Failed_State.pieces.length > 0) {
		// 续点上传的分片状态分离器，返回未下载的分片
		return compact(
			Upload_From_Break_Failed_State.pieces.map(async (item, index) => {
				// 如果文件名存在，并且文件在本地
				if (item.filename && (await fsExists(item.filename))) {
					// 读取本地文件大小
					const localsize = await fsStat(item.filename).size;
					// 如果本地文件与分片大小符合，则确定下载完成
					if (localsize === item.size) {
						return;
					} else if (localsize > item.size) {
						// 如果大于切片，说明下载错了，删除重下
						item.relativeSite = 0;
						fsUnlink(item.filename).catch();
					} else {
						// 否则将读取到的文件大小赋值为当前的状态。
						item.relativeSite = localsize;
					}
				} else {
					item.relativeSite = 0;
				}
				return item;
			})
		);
	}
};
/**
 * 读取下载状态文件
 * @param {string} path 下载的json文件
 */
const Read_Upload_From_Break_Failed = async path => {
	if (await fsExists(path)) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) reject(err);
				resolve(JSON.parse(data));
			});
		});
	}
	return {};
};

/**
 * 更新状态保存本地
 * @param {*} state
 */
const Upload_From_Break_Failed = state => {
	const { _reversal, _save, ...newState } = state;
	if (!Object.keys(Upload_From_Break_Failed_State).length) {
		Upload_From_Break_Failed_State = JSON.parse(JSON.stringify(newState));
	} else {
		if (_reversal && !_save) {
			Upload_From_Break_Failed_State = merge(
				newState,
				Upload_From_Break_Failed_State
			);
		} else if (!_save) {
			Upload_From_Break_Failed_State = merge(
				Upload_From_Break_Failed_State,
				newState
			);
		}
	}
	if (Upload_From_Break_Failed_State.realpath || _save) {
		const rs = new Readable();
		rs.push(JSON.stringify(Upload_From_Break_Failed_State));
		rs.push(null);
		rs.pipe(
			fs.createWriteStream(
				Upload_From_Break_Failed_State.realpath + ".json"
			)
		);
	}
};
const downloadVideo = async (options, callback) => {
	// const { ditem } = options;
	// let filename = moment().format("YYYYMMDD");
	// if (!(ditem.title && ditem.title.trim().length > 0)) {
	// 	// return;
	// 	ditem.title = ;
	// }
	let filename = path.basename(options.out);
	console.log(filename);
	// filename += `_${ditem.quality}P_${ditem.key}.iso`;
	filename = clearFileName(filename);
	// const dir = fse.realpathSync(config.downloadDir || "./downloads");
	// if (!fse.existsSync(dir)) {
	// 	fse.mkdirpSync(dir);
	// }
	const dir = await fsRealPath(options.dir || "./downloads");

	await mkdirp(dir);

	const out = path.join(dir, filename);
	const maxChunkLen = 20 * 1024 * 1024;
	const req = {
		uri: options.uri,
		...baseReqOpts
	};
	// console.log(req);

	const obj = await canCutDown({ ...req, maxChunkLen });
	if (!obj) {
		return obj;
	}
	if (!obj.cut) {
		delete obj.cut;
		return await sDown({ ...req, ...{ obj, out, options } }, callback);
	} else {
		const localstate = await Read_Upload_From_Break_Failed(out + ".json");
		console.log(localstate);
		Upload_From_Break_Failed_State = {
			realdir: dir,
			filename,
			maxChunkLen,
			realpath: out,
			uri: options.uri,
			size: obj.reqOpts,
			pieces: obj.rgs.map((item, index) => {
				return {
					index,
					start: item.start,
					end: item.end,
					state: 0,
					relativeSite: 0,
					size: item.end - item.start + 1
				};
			})
		};
		Upload_From_Break_Failed({ _save: true });

		if (
			localstate.maxChunkLen ===
			Upload_From_Break_Failed_State.maxChunkLen
		) {
			Upload_From_Break_Failed_State = merge(
				Upload_From_Break_Failed_State,
				localstate
			);
			Upload_From_Break_Failed({ _save: true });
			obj.rgs = Inspect_Upload_From_Break_Failed_State();
			Upload_From_Break_Failed({ _save: true });
		}
		delete obj.cut;
		return await bDown(
			{ ...req, ...{ rgs: obj.rgs, out, dir, options } },
			callback
		);
	}
};
const bDown = async (o, callback) => {
	const { rgs, dir, options, out, ...reqOpts } = o;
	const files = JSON.parse(
		JSON.stringify(Upload_From_Break_Failed_State.pieces)
	);
	await loop(files, reqOpts, dir, options, callback);
	const Inspect = Inspect_Upload_From_Break_Failed_State();
	Upload_From_Break_Failed({ _save: true });
	if (Inspect.length) {
		await loop(rgs, reqOpts, dir, options, callback);
	}
	console.log("all pieces have been downloaded!");
	console.log("now, concat pieces...");
	const ws = fs.createWriteStream(out, { flags: "a" });
	files.forEach(file => {
		fs.readFile(file.filename, (err, data) => {
			if (!err) {
				ws.write(data);
			}
		});
	});
	ws.end();

	// delete temp files
	console.log("now, delete pieces...");
	files.forEach(file => {
		fs.unlink(file.filename, () => {});
	});

	return `${out} has been downloaded!`;
};

const loop = async (pieces, reqOpts, dir, options, callback) => {
	for (const item of pieces) {
		const copyOpts = JSON.parse(JSON.stringify(reqOpts));
		const read =
			Upload_From_Break_Failed_State.pieces[item.index].relativeSite;
		copyOpts.read = read;
		copyOpts.size = Upload_From_Break_Failed_State.pieces[item.index].size;
		copyOpts.headers.Range = `bytes=${item.start + read}-${item.end}`;
		copyOpts.headers.Connection = "keep-alive";

		const file = path.join(dir, `${options.key || ""}${item.index}`);
		item.filename = file;
		console.log(
			`downloading the ${item.index + 1}/${
				Upload_From_Break_Failed_State.pieces.length
			} piece...`
		);

		Upload_From_Break_Failed_State.pieces[item.index] = JSON.parse(
			JSON.stringify(item)
		);
		Upload_From_Break_Failed({ _save: true });
		let downCompleted = 0;
		let downTime = 0;
		await new Promise(resolve => {
			Get({
				...copyOpts,
				...{ out: file, hiden: true }
			})
				.on("progress", res => {
					downCompleted = res.completed;
					if (
						new Date().valueOf() / 1000 - parseInt(res.time.start) >
						downTime
					) {
						downTime += 15;
						Upload_From_Break_Failed_State.pieces[
							item.index
						].relativeSite = downCompleted;
						Upload_From_Break_Failed({ _save: true });
					}
					callback(res);
				})
				.on("error", err => {
					if (err) {
						Upload_From_Break_Failed_State.pieces[
							item.index
						].relativeSite = downCompleted;
						Upload_From_Break_Failed({ _save: true });
					} else {
						Upload_From_Break_Failed_State.pieces[
							item.index
						].relativeSite = downCompleted;
						Upload_From_Break_Failed_State.pieces[
							item.index
						].state = 1;
						Upload_From_Break_Failed({ _save: true });
					}
				})
				.on("end", () => {
					resolve();
					console.log(`file${item.index} has been downloaded!`);
				})
				.pipe(fs.createWriteStream(file));
		});
	}
};
const sDown = async (o, callback) => {
	const { obj, out, options, ...reqOpts } = o;
	const copyOpts = JSON.parse(JSON.stringify(reqOpts));
	copyOpts.headers.Connection = "keep-alive";
	return await new Promise(resolve => {
		Get({ ...reqOpts, ...{ out, hiden: true } })
			.on("progress", callback)
			.on("end", () => {
				resolve(`${out} has been downloaded!`);
			})
			.pipe(fs.createWriteStream(out));
	});
};

module.exports = downloadVideo;
