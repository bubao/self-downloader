/**
 * @Description: qs
 * @Author: bubao
 * @Date: 2020-03-07 21:50:28
 * @last author: bubao
 * @last edit time: 2021-03-05 00:52:55
 */
const qs = require("qs");
const querystring = require("querystring");

class QueryString {
	constructor(options) {
		this.lib = null;
		this.useQuerystring = null;
		this.parseOptions = null;
		this.stringifyOptions = null;
		this.unescape = querystring.unescape;
		if (options) {
			return this.init(options);
		}
	}

	static init(options = {}) {
		if (this.lib) return;
		this.useQuerystring = options.useQuerystring;
		this.lib = this.useQuerystring ? querystring : qs;
		this.parseOptions = options.qsParseOptions || {};
		this.stringifyOptions = options.qsStringifyOptions || {};
		return this.lib;
	}

	stringify(obj) {
		return this.useQuerystring
			? this.rfc3986(
				this.lib.stringify(
					obj,
					this.stringifyOptions.sep || null,
					this.stringifyOptions.eq || null,
					this.stringifyOptions
				)
			)
			: this.lib.stringify(obj, this.stringifyOptions);
	}

	parse(str) {
		return this.useQuerystring
			? this.lib.parse(
				str,
				this.parseOptions.sep || null,
				this.parseOptions.eq || null,
				this.parseOptions
			)
			: this.lib.parse(str, this.parseOptions);
	}

	rfc3986(str) {
		return str.replace(/[!'()*]/g, function(c) {
			return (
				"%" +
				c
					.charCodeAt(0)
					.toString(16)
					.toUpperCase()
			);
		});
	}
}

module.exports = QueryString;
