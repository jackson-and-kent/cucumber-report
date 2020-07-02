#!/usr/bin/env node
let watch = require("node-watch");
let child_process = require("cross-spawn");
let running = false;
let cucumber;

let JS_EXT = /^.*\.js/i;

watch(["."], {"recursive": true}, (event, filename) => {

	if (!running && filename.match(JS_EXT)) {

		running = true;

		eslint = child_process.spawn("npx", [
			"eslint",
			".",
			"--fix"
		]).on("exit", () => {

			running = false;
			return true;

		});

		eslint.stdout.on("data", (d) => {

			console.log(String(d));

		});

		eslint.stderr.on("data", (d) => {

			console.error(String(d));

		});

	}

});
