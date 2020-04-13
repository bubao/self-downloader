/**
 * @Description: 
 * @Author: bubao
 * @Date: 2020-03-08 13:33:59
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 19:53:55
 */
module.exports = {
	root: true,
	env: {
		es6: true,
		node: true
	},
	extends: ["standard", "prettier", "plugin:node/recommended"],
	plugins: ["standard", "prettier", "json"],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly"
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module"
	},
	rules: {
		"no-return-await":0,
		"prettier/prettier": "error",
		semi: [2, "always"],
		quotes: [2, "double"],
		"no-multiple-empty-lines": "error",
		"no-var": "error",
		"no-template-curly-in-string": "off",
		"node/no-deprecated-api": "off",
		camelcase: "off",
		"no-bitwise": "off",
		"no-case-declarations": "off",
		"no-new": "off",
		"new-cap": "off",
		"no-unmodified-loop-condition": "off",
		"no-loop-func": "off",
		"prefer-promise-reject-errors": "off",
		"node/no-unsupported-features/es-syntax": "off",
		"standard/no-callback-literal": "off",
		"json/*": ["off", { allowComments: true }]
	}
};
