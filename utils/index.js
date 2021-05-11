/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-08 22:52:04
 * @last author: bubao
 * @last edit time: 2021-03-05 00:54:39
 */
const { URL, URLSearchParams } = require("url");
const crypto = require("crypto");
const path = require("path");
function clamp(value, min, max) {
	if (min === undefined) {
		return value;
	}
	if (max === undefined) {
		max = min;
	}
	if (isNaN(min - 0) || isNaN(max - 0)) {
		return value;
	}
	if (max === min) {
		return value < max ? value : max;
	}
	if (value > max) {
		return max;
	}
	if (value < min) {
		return min;
	}
	return value;
}

/**
 * @description 获取url的参数
 * @author bubao
 * @date 2021-02-06
 * @param {{
 *     offset:number, limit:number
 *   }} params
 * @returns {{
 *   limit: number;
 *   "amp;offset": number;
 *  }}
 */
function getURLParams(params) {
	let { offset, limit, ...other } = params;
	limit = limit ? clamp(limit, 1, 20) : undefined;
	offset = isNaN(offset * limit) ? offset * limit : undefined;
	return {
		limit: limit,
		"amp;offset": offset,
		...other
	};
}

/**
 * @description
 * @author bubao
 * @date 2021-02-06
 * @param {string} url
 * @returns
 */
function defaultName(url) {
	return path.basename(parseURL(url).pathname);
}

/**
 * @description
 * @author bubao
 * @date 2021-02-06
 * @param {string} url
 * @returns
 */
function parseURL(url) {
	return new URL(url);
}

/**
 * @description md5
 * @author bubao
 * @date 2021-02-06
 * @param {string} str
 * @returns
 */
function MD5(str) {
	return crypto
		.createHash("md5")
		.update(str, "utf8")
		.digest("hex");
}

/**
 * 获取真实url
 * @param {string} url url
 * @param {object} params url参数object
 */
function getTrueURL(url, params) {
	url = parseURL(url);
	url.search = new URLSearchParams(getURLParams(params));
	return url.toString();
}

/**
 * @description 字节转换
 * @author bubao
 * @date 2021-02-06
 * @param {number} limit
 * @returns
 */
function byteSize(limit) {
	let size = "";
	if (limit < 0.1 * 1024) {
		// 小于0.1KB，则转化成B
		size = limit.toFixed(2) + "B";
	} else if (limit < 0.1 * 1024 * 1024) {
		// 小于0.1MB，则转化成KB
		size = (limit / 1024).toFixed(2) + "KB";
	} else if (limit < 0.1 * 1024 * 1024 * 1024) {
		// 小于0.1GB，则转化成MB
		size = (limit / (1024 * 1024)).toFixed(2) + "MB";
	} else {
		// 其他转化成GB
		size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
	}

	const sizeStr = size + ""; // 转成字符串
	const index = sizeStr.indexOf("."); // 获取小数点处的索引
	const dou = sizeStr.substr(index + 1, 2); // 获取小数点后两位的值
	if (dou === "00") {
		// 判断后两位是否为00，如果是则删除00
		return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
	}
	return size;
}

/**
 * 时间转化
 * @param {number} d date
 */
function time(d) {
	d = parseInt(d);
	let s;
	let m;
	let h = 0;
	let t = "";
	if (d < 60) {
		s = d % 60;
		t = s + "秒";
	} else if (d < 60 * 60) {
		s = d % 60;
		m = (d - s) / 60;
		t = _pad(m) + "分" + _pad(s) + "秒";
	} else {
		h = parseInt(d / 60 / 60);
		m = parseInt((d - h * 60 * 60) / 60);
		s = d - h * 60 * 60 - m * 60;
		t = _pad(h) + ":" + _pad(m) + ":" + _pad(s);
	}
	return t;
}

/**
 * 数字保留c位
 * @param {number} n 数字
 * @param {number} c 保留位,默认为两位
 */
function _pad(n, c = 2) {
	n = String(n);
	while (n.length < c) {
		n = "0" + n;
	}
	return n;
}
/**
 * 修改后缀名
 * @param {string} name 需要修改后缀的文件名
 * @param {string} ext 有后缀名的文件名
 */
function fileName(name, ext) {
	name = path.basename(name);
	if (!ext) {
		ext = name;
	}
	const matches = ext.match(/\.([^.]+)$/);
	if (matches !== null) {
		ext = "." + matches[matches.length - 1];
	} else {
		ext = "";
	}
	return name.split(".").shift() + ext;
}
const getStrBySecs = secs => {
	let str = "0 sec";
	if (secs > 0) {
		const mins = parseInt(secs / 60);
		const modSecs = secs % 60;
		const hours = parseInt(mins / 60);
		const modMins = mins % 60;
		const days = parseInt(hours / 24);
		const modHours = hours % 24;

		if (days) {
			str =
				`${days} day(s) ${modHours} hour(s)` +
				` ${modMins} min(s) ${modSecs} sec(s)`;
		} else if (hours) {
			str = `${hours} hour(s) ${modMins} min(s) ${modSecs} sec(s)`;
		} else if (mins) {
			str = `${mins} min(s) ${modSecs} sec(s)`;
		} else {
			str = `${modSecs} sec(s)`;
		}
	}

	return str;
};

const getRoundNum = (num, len = 2) => {
	return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
};

const getSpeedByBytes = bytes => {
	let str = "0 bytes/sec";
	if (bytes > 0) {
		const kbs = getRoundNum(bytes / 1024);
		const mbs = getRoundNum(bytes / (1024 * 1024));
		const gbs = getRoundNum(bytes / (1024 * 1024 * 1024));

		if (parseFloat(gbs) >= 1) {
			str = `${gbs} Gb/sec`;
		} else if (parseFloat(mbs) >= 1) {
			str = `${mbs} Mb/sec`;
		} else if (parseFloat(kbs) >= 1) {
			str = `${kbs} Kb/sec`;
		} else {
			str = `${bytes} bytes/sec`;
		}
	}

	return str;
};

const clearFileName = filename => {
	if (filename && filename.trim().length > 0) {
		return filename.replace(/\//g, "_").replace(/\\/g, "_");
	} else {
		return filename;
	}
};

function isObject(value) {
	const type = typeof value;
	return value !== null && (type === "object" || type === "function");
}

// { a: [{ b: 2 }] } { a: [{ c: 2 }]} -> { a: [{b:2}, {c:2}]}
// merge({o: {a: 3}}, {o: {b:4}}) => {o: {a:3, b:4}}
function merge(source, other) {
	if (!isObject(source) || !isObject(other)) {
		return other === undefined ? source : other;
	}
	// 合并两个对象的 key，另外要区分数组的初始值为 []
	return Object.keys({
		...source,
		...other
	}).reduce(
		(acc, key) => {
			// 递归合并 value
			acc[key] = merge(source[key], other[key]);
			return acc;
		},
		Array.isArray(source) ? [] : {}
	);
}

module.exports = {
	getURLParams,
	getTrueURL,
	parseURL,
	byteSize,
	fileName,
	time,
	_pad,
	defaultName,
	MD5,
	clearFileName,
	getSpeedByBytes,
	getStrBySecs,
	merge
};
