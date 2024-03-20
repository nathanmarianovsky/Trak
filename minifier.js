/*

Declare all of the necessary variables.

	- htmlMinify provides the tool used to compress html files.
	- minify provides the tool used to compress css and js files.
	- yui and uglifyJS provide the compression algorithms for css and js files, respectively.
	- cliProgress provides the means to display a load bar on the command line interface.
	- fs and path provide the means to work with local files.
	- cheerio provides a jQuery-like library to work with html files in the back-end.

*/
const htmlMinify = require("html-minifier").minify,
	minify = require("@node-minify/core"),
	yui = require("@node-minify/yui"),
	uglifyJS = require("@node-minify/uglify-js"),
	cliProgress = require("cli-progress"),
	fs = require("fs-extra"),
	path = require("path"),
	cheerio = require("cheerio");



// Append the appropriate sections to the index html file.
console.log("Adding Settings to Appropriate HTML Files.");
const htmlSettingsList = ["index.html"],
	htmlList = ["addRecord.html", "splash.html"],
	htmlSettings = fs.readFileSync(path.join(__dirname, "pages", "dev", "settings.html")),
	htmlUpdate = fs.readFileSync(path.join(__dirname, "pages", "dev", "update.html")),
	htmlSynopsis = fs.readFileSync(path.join(__dirname, "pages", "dev", "synopsis.html")),
	htmlImport = fs.readFileSync(path.join(__dirname, "pages", "dev", "import.html")),
	htmlIntroduction = fs.readFileSync(path.join(__dirname, "pages", "dev", "introduction.html")),
	htmlDatabase = fs.readFileSync(path.join(__dirname, "pages", "dev", "database.html")),
	htmlNotifications = fs.readFileSync(path.join(__dirname, "pages", "dev", "notifications.html")),
	htmlFilter = fs.readFileSync(path.join(__dirname, "pages", "dev", "filter.html"));
for(let t = 0; t < htmlSettingsList.length; t++) {
	let data = fs.readFileSync(path.join(__dirname, "pages", "dev", htmlSettingsList[t]), "UTF8"),
		$ = cheerio.load(data);
	$("#settingsModal").html(htmlSettings);
	$("#updateModal").html(htmlUpdate);
	$("#synopsisModal").html(htmlSynopsis);
	$("#importModal").html(htmlImport);
	$("#introductionModal").html(htmlIntroduction);
	$("#databaseModal").html(htmlDatabase);
	$("#notificationsModal").html(htmlNotifications);
	$("#filterModal").html(htmlFilter);
	if(!fs.existsSync(path.join(__dirname, "pages", "dev", "sectionsAttached"))) {
		fs.mkdirSync(path.join(__dirname, "pages", "dev", "sectionsAttached"), { "recursive": true });
	}
	fs.writeFileSync(path.join(__dirname, "pages", "dev", "sectionsAttached", "sectionsAttached" + htmlSettingsList[t].charAt(0).toUpperCase() + htmlSettingsList[t].slice(1)), $.html(), "UTF8");
}



// Compress the html files.
console.log("Starting Compression of HTML Files without Sections:");
if(!fs.existsSync(path.join(__dirname, "pages", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "pages", "dist"));
}
const htmlBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect);
for(let r = 0; r < htmlList.length; r++) {
	let file = htmlList[r],
		settingsHtmlBarRow = htmlBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file}),
		data = fs.readFileSync(path.join(__dirname, "pages", "dev", file), "UTF8");
	fs.writeFileSync(path.join(__dirname, "pages", "dist", file), htmlMinify(data, {
		"removeComments": true,
		"removeCommentsFromCDATA": true,
		"collapseInlineTagWhitespace": true,
		"removeAttributeQuotes": true,
		"useShortDoctype": true,
		"minifyJS": true,
		"minifyCSS": true
	}));
	settingsHtmlBarRow.update(1);
}
htmlBar.stop();
console.log("Starting Compression of HTML Files with Sections:");
const settingsHtmlBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect);
for(let r = 0; r < htmlSettingsList.length; r++) {
	let file = htmlSettingsList[r],
		settingsHtmlBarRow = settingsHtmlBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file}),
		data = fs.readFileSync(path.join(__dirname, "pages", "dev", "sectionsAttached", "sectionsAttached" + file.charAt(0).toUpperCase() + file.slice(1)), "UTF8");
	fs.writeFileSync(path.join(__dirname, "pages", "dist", file), htmlMinify(data, {
		"removeComments": true,
		"removeCommentsFromCDATA": true,
		"collapseInlineTagWhitespace": true,
		"removeAttributeQuotes": true,
		"useShortDoctype": true,
		"minifyJS": true,
		"minifyCSS": true
	}));
	settingsHtmlBarRow.update(1);
}
settingsHtmlBar.stop();



// Compress the css files.
console.log("Starting Compression of CSS Files:");
if(!fs.existsSync(path.join(__dirname, "styles", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "styles", "dist"));
}
const cssBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect),
	inputDir = path.join(__dirname, "styles", "dev");
let cssBarRow = cssBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | styles.css"});
minify({
	"compressor": yui,
	"type": "css",
	"input": fs.readdirSync(inputDir).filter(file => file != "splash.css").map(elem => path.join(__dirname, "styles", "dev", elem)),
	"output": path.join(__dirname, "styles", "dist", "styles.css"),
	"callback": (err, result) => {
		if(err) {
			console.log("Minifying the styles css file threw an error: " + err.stack);
		}
	}
});
cssBarRow.update(1);
cssBarRow = cssBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | splash.css"});
minify({
	"compressor": yui,
	"type": "css",
	"input": path.join(__dirname, "styles", "dev", "splash.css"),
	"output": path.join(__dirname, "styles", "dist", "splash.css"),
	"callback": (err, result) => {
		if(err) {
			console.log("Minifying the splash css file threw an error: " + err.stack);
		}
	}
});
cssBarRow.update(1);
cssBar.stop();



// Compress the js back-end files.
console.log("Starting Compression of BackEnd JS Files:");
if(!fs.existsSync(path.join(__dirname, "scripts", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist"));
}
if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "backEnd"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist", "backEnd"));
}
if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "frontEnd"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist", "frontEnd"));
}
const jsEndList = fs.readdirSync("./scripts/dev/backEnd"),
	jsFrontList = fs.readdirSync("./scripts/dev/frontEnd"),
	jsEndBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect),
	jsFrontBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect);
for(let k = 0; k < jsEndList.length; k++) {
	let file = jsEndList[k],
		jsEndBarRow = jsEndBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file});
	minify({
		"compressor": uglifyJS,
		"type": "js",
		"input": path.join(__dirname, "scripts", "dev", "backEnd", file),
		"output": path.join(__dirname, "scripts", "dist", "backEnd", file),
		"callback": (err, result) => {
			if(err) {
				console.log("Minifying the js file " + file + " threw an error: " + err.stack);
			}
		}
	});
	jsEndBarRow.update(1);
}
jsEndBar.stop();



// Compress the js front-end files.
console.log("Starting Compression of FrontEnd JS Files:");
for(let l = 0; l < jsFrontList.length; l++) {
	let file = jsFrontList[l];
	if(!file.includes(".js")) {
		let jsFrontSublist = fs.readdirSync(path.join(__dirname, "scripts", "dev", "frontEnd", file));
		if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "frontEnd", file))) {
			fs.mkdirSync(path.join(__dirname, "scripts", "dist", "frontEnd", file));
		}
		for(let t = 0; t < jsFrontSublist.length; t++) {
			let subFile = jsFrontSublist[t];
				jsSubFrontBarRow = jsFrontBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file + "/" + subFile});
			minify({
				"compressor": uglifyJS,
				"type": "js",
				"input": path.join(__dirname, "scripts", "dev", "frontEnd", file, subFile),
				"output": path.join(__dirname, "scripts", "dist", "frontEnd", file, subFile),
				"callback": (err, result) => {
					if(err) {
						console.log("Minifying the js file " + subFile + " threw an error: " + err.stack);
					}
				}
			});
			jsSubFrontBarRow.update(1);
		}
	}
	else {
		let jsFrontBarRow = jsFrontBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file});
		minify({
			"compressor": uglifyJS,
			"type": "js",
			"input": path.join(__dirname, "scripts", "dev", "frontEnd", file),
			"output": path.join(__dirname, "scripts", "dist", "frontEnd", file),
			"callback": (err, result) => {
				if(err) {
					console.log("Minifying the js file " + file + " threw an error: " + err.stack);
				}
			}
		});
		jsFrontBarRow.update(1);
	}
}
jsFrontBar.stop();



// Remove the menu attached html files inside the dev folder.
fs.rmSync(path.join(__dirname, "pages", "dev", "sectionsAttached"), {"recursive": true, "force": true});



// Notify that all tasks have been handled.
console.log("All CSS, HTML, and JS Files Have Been Minified!");