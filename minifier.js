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
	cheerio = require("cheerio"),
	log = require("electron-log"),
	store = process.argv.includes("--store");



log.info("The minification process for the application has initiated.");


// Append the appropriate sections to the html files.
log.info("Adding sections to appropriate html Files.");
const htmlSettingsList = ["index.html", "addRecord.html"],
	htmlList = ["splash.html"],
	htmlSettings = fs.readFileSync(path.join(__dirname, "pages", "dev", "settings.html")),
	htmlAccount = fs.readFileSync(path.join(__dirname, "pages", "dev", "account.html")),
	htmlUpdate = fs.readFileSync(path.join(__dirname, "pages", "dev", "update.html")),
	htmlIcon = fs.readFileSync(path.join(__dirname, "pages", "dev", "icon.html")),
	htmlBookmark = fs.readFileSync(path.join(__dirname, "pages", "dev", "bookmark.html")),
	htmlSynopsis = fs.readFileSync(path.join(__dirname, "pages", "dev", "synopsis.html")),
	htmlImport = fs.readFileSync(path.join(__dirname, "pages", "dev", "import.html")),
	htmlMerge = fs.readFileSync(path.join(__dirname, "pages", "dev", "merge.html")),
	htmlIntroduction = fs.readFileSync(path.join(__dirname, "pages", "dev", "introduction.html")),
	htmlDatabase = fs.readFileSync(path.join(__dirname, "pages", "dev", "database.html")),
	htmlNotifications = fs.readFileSync(path.join(__dirname, "pages", "dev", "notifications.html")),
	htmlFilter = fs.readFileSync(path.join(__dirname, "pages", "dev", "filter.html")),
	htmlTitlebar = fs.readFileSync(path.join(__dirname, "pages", "dev", "titlebar.html")),
	htmlGenres = fs.readFileSync(path.join(__dirname, "pages", "dev", "genres.html")),
	htmlAssociations = fs.readFileSync(path.join(__dirname, "pages", "dev", "associations.html"));
let data = fs.readFileSync(path.join(__dirname, "pages", "dev", "index.html"), "UTF8"),
	$ = cheerio.load(data);
if(!fs.existsSync(path.join(__dirname, "pages", "dev", "sectionsAttached"))) {
	fs.mkdirSync(path.join(__dirname, "pages", "dev", "sectionsAttached"), { "recursive": true });
}
else { fs.emptyDirSync(path.join(__dirname, "pages", "dev", "sectionsAttached")); }
$("#settingsModal").html(htmlSettings);
$("#accountModal").html(htmlAccount);
$("#updateModal").html(htmlUpdate);
$("#iconModal").html(htmlIcon);
$("#bookmarkModal").html(htmlBookmark);
$("#synopsisModal").html(htmlSynopsis);
$("#importModal").html(htmlImport);
$("#mergeModal").html(htmlMerge);
$("#introductionModal").html(htmlIntroduction);
$("#databaseModal").html(htmlDatabase);
if(store == true) {
	$(".snapRemoval").remove();
	$("#exportPath").attr("disabled", true);
}
$("#notificationsModal").html(htmlNotifications);
$("#filterModal").html(htmlFilter);
$("#titleBar").html(htmlTitlebar);
fs.writeFileSync(path.join(__dirname, "pages", "dev", "sectionsAttached", "sectionsAttached" + "index.html".charAt(0).toUpperCase() + "index.html".slice(1)), $.html(), "UTF8");
data = fs.readFileSync(path.join(__dirname, "pages", "dev", "addRecord.html"), "UTF8");
$ = cheerio.load(data);
$("#titleBar").html(htmlTitlebar);
$("#genresModal").html(htmlGenres);
$("#associationsModal").html(htmlAssociations);
fs.writeFileSync(path.join(__dirname, "pages", "dev", "sectionsAttached", "sectionsAttached" + "addRecord.html".charAt(0).toUpperCase() + "addRecord.html".slice(1)), $.html(), "UTF8");



// Compress the html files.
log.info("Starting compression of html files without sections:");
if(!fs.existsSync(path.join(__dirname, "pages", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "pages", "dist"));
}
else { fs.emptyDirSync(path.join(__dirname, "pages", "dist")); }
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
	}), "UTF8");
	settingsHtmlBarRow.update(1);
}
htmlBar.stop();
log.info("Starting compression of html files with sections:");
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
log.info("Starting compression of css files:");
if(!fs.existsSync(path.join(__dirname, "styles", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "styles", "dist"));
}
else { fs.emptyDirSync(path.join(__dirname, "styles", "dist")); }
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
			log.info("Minifying the styles css file threw an error: " + err.stack);
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
			log.info("Minifying the splash css file threw an error: " + err.stack);
		}
	}
});
cssBarRow.update(1);
cssBar.stop();



// Compress the js back-end files.
log.info("Starting compression of back-end js files:");
if(!fs.existsSync(path.join(__dirname, "scripts", "dist"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist"));
}
else { fs.emptyDirSync(path.join(__dirname, "scripts", "dist")); }
if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "backEnd"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist", "backEnd"));
}
else { fs.emptyDirSync(path.join(__dirname, "scripts", "dist", "backEnd")); }
if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "frontEnd"))) {
	fs.mkdirSync(path.join(__dirname, "scripts", "dist", "frontEnd"));
}
else { fs.emptyDirSync(path.join(__dirname, "scripts", "dist", "frontEnd")); }
const jsEndList = fs.readdirSync("./scripts/dev/backEnd"),
	jsFrontList = fs.readdirSync("./scripts/dev/frontEnd"),
	jsEndBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect),
	jsFrontBar = new cliProgress.MultiBar({}, cliProgress.Presets.rect);
for(let k = 0; k < jsEndList.length; k++) {
	if(jsEndList[k] != "update.js" || (jsEndList[k] == "update.js" && store == false)) {
		let file = jsEndList[k],
			jsEndBarRow = jsEndBar.create(1, 0, {}, {"format": "[{bar}] {percentage}% | " + file});
		minify({
			"compressor": uglifyJS,
			"type": "js",
			"input": path.join(__dirname, "scripts", "dev", "backEnd", file),
			"output": path.join(__dirname, "scripts", "dist", "backEnd", file),
			"callback": (err, result) => {
				if(err) {
					log.info("Minifying the js file " + file + " threw an error: " + err.stack);
				}
			}
		});
		jsEndBarRow.update(1);
	}
}
jsEndBar.stop();



// Compress the js front-end files.
log.info("Starting compression of front-end js files:");
for(let l = 0; l < jsFrontList.length; l++) {
	let file = jsFrontList[l];
	if(!file.includes(".js")) {
		let jsFrontSublist = fs.readdirSync(path.join(__dirname, "scripts", "dev", "frontEnd", file));
		if(!fs.existsSync(path.join(__dirname, "scripts", "dist", "frontEnd", file))) {
			fs.mkdirSync(path.join(__dirname, "scripts", "dist", "frontEnd", file));
		}
		else { fs.emptyDirSync(path.join(__dirname, "scripts", "dist", "frontEnd", file)); }
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
						log.info("Minifying the js file " + subFile + " threw an error: " + err.stack);
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
					log.info("Minifying the js file " + file + " threw an error: " + err.stack);
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
log.info("All css, html, and js files have been minified, finishing the minification process.");