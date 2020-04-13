/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-09 14:48:21
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 19:58:10
 */

const http = require("http");
const https = require("https");
const Schema = require("validate");
const util = require("util");
const urlParser = require("../utils/urlParser");
const isObject = util.isObject;
const isUndefined = util.isUndefined;
const throttle = require("throttleit");

function onRequest(context) {
	console.log(context);
	// Reset dynamic stuff
	context.startedAt = null;

	context.state = context.request.progressState = null;

	context.delayTimer && clearTimeout(context.delayTimer);
	context.delayTimer = null;
}

function onResponse(context, response) {
	// Mark start timestamp
	context.startedAt = Date.now();
	console.log(context);
	// Create state
	// Also expose the state throught the request
	// See https://github.com/IndigoUnited/node-request-progress/pull/2/files
	context.state = context.request.progressState = {
		time: {
			elapsed: 0,
			remaining: null
		},
		speed: null,
		percent: null,
		size: {
			total:
				Number(response.headers[context.options.lengthHeader]) || null,
			transferred: 0
		}
	};

	// Delay the progress report
	context.delayTimer = setTimeout(function() {
		context.delayTimer = null;
	}, context.options.delay);
}

function onData(context, data) {
	context.state.size.transferred += data.length;
	console.log(context);
	!context.delayTimer && context.reportState();
}

function onEnd(context) {
	/* istanbul ignore if */
	console.log(context);
	if (context.delayTimer) {
		clearTimeout(context.delayTimer);
		context.delayTimer = null;
	}

	context.request.progressState = context.request.progressContext = null;
}

function reportState(context) {
	// Do nothing if still within the initial delay or if already finished
	if (context.delayTimer || !context.request.progressState) {
		return;
	}

	const state = context.state;
	state.time.elapsed = (Date.now() - context.startedAt) / 1000;

	// Calculate speed only if 1s has passed
	if (state.time.elapsed >= 1) {
		state.speed = state.size.transferred / state.time.elapsed;
	}

	// Calculate percent & remaining only if we know the total size
	if (state.size.total != null) {
		state.percent =
			Math.min(state.size.transferred, state.size.total) /
			state.size.total;

		if (state.speed != null) {
			state.time.remaining =
				state.percent !== 1
					? state.size.total / state.speed - state.time.elapsed
					: 0;
			state.time.remaining =
				Math.round(state.time.remaining * 1000) / 1000; // Round to 4 decimals
		}
	}

	context.request.emit("progress", state);
}

const requestOptions = new Schema({
	uri: {
		type: "string",
		required: true,
		message: {
			type: "uri must be a string.",
			required: "uri is required."
		}
	},
	method: {
		type: "string",
		enum: ["GET", "POST", "PUT"],
		message: "method must be one of GET, POST or PUT"
	},
	json: {
		type: "boolean",
		message: "json must be a boolean"
	}
});

const OptionsHandler = options => {
	// ? options 为空不允许执行
	if (isUndefined(options)) {
		throw new Error("options is undefined");
	}
	// ? options不是对象
	if (!isObject(options)) {
		// ? options 不是 string
		throw new Error("options must be a object");
	}
	const errors = requestOptions.validate(options);
	if (!options.method) {
		options.method = "GET";
	}
	if (errors.length) {
		throw new Error(errors.join("\n"));
	}
	const result = urlParser(options.uri);
	options = {
		...options,
		url: options.uri,
		headers: {
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
		},
		parse: result
	};
	return options;
};

function requestProgress(options) {
	// * 检查文件路径以及文件名
	options = OptionsHandler(options);
	console.log(options);
	// * 处理uri选用合适的请求方法
	const method = options.parse.protocol === "http:" ? http : https;
	// TODO 提供监听方法 progress start
	// TODO 封装成Promise
	// Parse options
	options = options || {};
	options.throttle = options.throttle == null ? 1000 : options.throttle;
	options.delay = options.delay || 0;
	options.lengthHeader = options.lengthHeader || "content-length";

	// Create context
	const context = {};
	context.options = options;
	context.reportState = throttle(
		reportState.bind(null, context),
		options.throttle
	);
	delete options.parse.query;
	const reqOptions = {
		uri: options.uri,
		...options.parse,
		method: options.method
		// headers: options.headers
	};
	console.log(reqOptions);
	const request = method.request(reqOptions);

	request
		// .on("request", onRequest.bind(null, context))
		.on("response", function handleResponse(response) {
			response.on("data", onData.bind(null, context));

			return onResponse(context, response);
		})
		.on("end", onEnd.bind(null, context));

	request.progressContext = context;

	return request;
}
module.exports = requestProgress;
// console.log(OptionsHandler("https://sss"));
