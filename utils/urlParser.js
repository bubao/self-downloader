/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-08 13:41:05
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 18:46:44
 */
const URL = require("url");
const qs = require("qs");

/**
 * http url parser
 *
 * @author bubao
 * @date 2020-03-08
 * @param {String} str
 * @returns {Object} parse result
 */
function parse(str) {
	const result = URL.parse(str);
	result.query = qs.parse(result.query);
	if (!(result.protocol === "https:" || result.protocol === "http:")) {
		throw new Error("url must be https or http");
	}
	return result;
}

module.exports = parse;
