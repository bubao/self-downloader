/**
 * @Description:
 * @Author: bubao
 * @Date: 2020-03-09 18:08:23
 * @LastEditors: bubao
 * @LastEditTime: 2020-03-09 22:01:29
 */
// const fs = require("fs");
// const request = require("request");
const request = require("../lib/getState");
// const progress = require("request-progress");
// progress(
// 	request({
// 		uri:
// 			"http://mirrors.163.com/archlinux/iso/2020.03.01/archlinux-2020.03.01-x86_64.iso"
// 	})
// )
request(
	{
		uri:
			"http://mirrors.163.com/archlinux/iso/2020.03.01/archlinux-2020.03.01-x86_64.iso",
		out: "./archlinux-2020.03.01-x86_64.iso",
		dir: "./downloads"
	},
	() => {}
);
// 	.on("progress", function(state) {
// 	// The state is an object that looks like this:
// 	// {
// 	//     percent: 0.5,               // Overall percent (between 0 to 1)
// 	//     speed: 554732,              // The download speed in bytes/sec
// 	//     size: {
// 	//         total: 90044871,        // The total payload size in bytes
// 	//         transferred: 27610959   // The transferred payload size in bytes
// 	//     },
// 	//     time: {
// 	//         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
// 	//         remaining: 81.403       // The remaining seconds to finish (3 decimals)
// 	//     }
// 	// }
// 	console.log("progress", state);
// })
// .on("error", function(err) {
// 	// Do something with err
// 	console.log(err);
// })
// .on("end", function() {
// 	// Do something after request finishes
// })
// .pipe(fs.createWriteStream("./archlinux-2020.03.01-x86_64.iso"));
