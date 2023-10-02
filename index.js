/*

Declare all of the necessary variables.

	- app, BrowserWindow, Menu, MenuItem, Tray, ipc, and shell provide the means to operate the Electron app.
	- fs and path provide the means to work with local files.
	- https provides the means to download files.
	- log provides the means to create application logs to keep track of what is going on.
	- contextMenu provides the means to handle the menu associated to a right-click in the app.
	- tools provides a collection of local functions meant to help with writing files.
	- appListeners provides all of the back-end listeners.
	- exec provides the means to open files and folders.
	- zipper is a library object which can create zip files.
	- malScraper provides the means to attain anime and manga records from myanimelist.
	- os provides the means to get information on the user operating system.
	- spawn provides the means to launch an update via an installer.
	- downloadRelease provides the means to download a github release asset.
	- semver provides the means to compare semantic versioning.
	- ExcelJS provides the means to export/import xlsx files.
	- basePath is the path to the local settings data.
	- localPath is the path to the local user data.

*/
const { app, BrowserWindow, Menu, MenuItem, Tray, shell } = require("electron"),
	ipc = require("electron").ipcMain,
	path = require("path"),
	fs = require("fs-extra"),
	https = require("https"),
	log = require("electron-log"),
	contextMenu = require('electron-context-menu'),
	tools = require("./scripts/dist/backEnd/tools"),
	appListeners = require("./scripts/dist/backEnd/appListeners"),
	exec = require("child_process").exec,
	zipper = require("zip-local"),
	malScraper = require("mal-scraper"),
	os = require("os"),
	spawn = require("child_process").spawn,
	// checkInternetConnected = require("check-internet-connected"),
	downloadRelease = require("download-github-release"),
	semver = require("semver"),
	ExcelJS = require("exceljs"),
	basePath = localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
	var localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
}
else {
	let configObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
	var localPath = configObj.current != undefined
		? configObj.current.path.substring(0, configObj.current.path.length - 10)
		: configObj.original.path.substring(0, configObj.original.path.length - 10);
}



// Make an entry in the logs to indicate that the application is starting up.
log.info("The application is starting.");



// Loads the Electron app by creating the primary window. 
app.whenReady().then(() => {
	// Create the Electron app menu.
	const template = [
		{"label": "Edit", "submenu": [
				{ "role": "undo" },
				{ "role": "redo" },
				{ "type": "separator" },
				{ "role": "cut" },
				{ "role": "copy" },
				{ "role": "paste" }
			]
		},
		{"label": "View", "submenu": [
				{ "role": "reload" },
				{ "role": "toggledevtools" },
				{ "type": "separator" },
				{ "role": "resetzoom" },
				{ "role": "zoomin" },
				{ "role": "zoomout" },
				{ "type": "separator" },
				{ "role": "togglefullscreen" }
			]
		},
		{"label": "Window", "submenu": [
				{ "role": "minimize" },
				{ "role": "quit" }
			]
		}
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
	contextMenu({
		"showSearchWithGoogle": true,
		"showSelectAll": true
	});

	// Create the configuration file if it does not exist.
	log.info("Creating the configuration file if it does not exist. To be located at " + path.join(basePath, "Trak", "config", "configuration.json"));
	if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
		fs.mkdirSync(path.join(basePath, "Trak", "config"), { "recursive": true });
		const writeData = { "original": {
				"path": path.join(basePath, "Trak", "data"),
				"primaryColor": "#2A2A8E",
				"secondaryColor": "#D9D9DB",
				"primaryWindowWidth": 1000,
				"primaryWindowHeight": 800,
				"primaryWindowFullscreen": false,
				"secondaryWindowWidth": 1400,
				"secondaryWindowHeight": 1000,
				"secondaryWindowFullscreen": false
			}
		};
		fs.writeFileSync(path.join(basePath, "Trak", "config", "configuration.json"), JSON.stringify(writeData), "UTF8");
	}

	// Create the location file if it does not exist.
	if(!fs.existsSync(path.join(basePath, "Trak", "config", "location.json"))) {
		log.info("Creating the location.json file. To be located at " + path.join(basePath, "Trak", "config", "location.json"));
		const writeLocation = { "appLocation": __dirname };
		fs.writeFileSync(path.join(basePath, "Trak", "config", "location.json"), JSON.stringify(writeLocation), "UTF8");
	}

	// Create the localPages folder if it does not exist.
	if(!fs.existsSync(path.join(basePath, "Trak", "localPages"))) {
		log.info("Creating the localPages folder. To be located at " + path.join(basePath, "Trak", "localPages"));
		fs.mkdirSync(path.join(basePath, "Trak", "localPages"));
	}

	// Create the localStyles folder if it does not exist.
	if(!fs.existsSync(path.join(basePath, "Trak", "localStyles"))) {
		log.info("Creating the localStyles folder. To be located at " + path.join(basePath, "Trak", "localStyles"));
		fs.mkdirSync(path.join(basePath, "Trak", "localStyles"));
	}

	// If the data folder does not exist, then create it.
	if(!fs.existsSync(path.join(basePath, "Trak", "data"))) {
		log.info("Creating the data folder. To be located at " + path.join(basePath, "Trak", "data"));
		fs.mkdirSync(path.join(basePath, "Trak", "data"), { "recursive": true });
	}

	// Create the TrakDownloads folder if it does not exist. If it does exist then empty it on load.
	if(!fs.existsSync(path.join(os.homedir(), "TrakDownloads"))) {
		log.info("Creating the TrakDownloads folder. To be located at " + path.join(os.homedir(), "TrakDownloads"));
		fs.mkdirSync(path.join(os.homedir(), "TrakDownloads"));
	}
	else {
		log.info("Emptying the TrakDownloads folder");
		fs.emptyDirSync(path.join(os.homedir(), "TrakDownloads"));
	}

	// Load the user's preferred window sizes if they exist.
	fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
		// If there was an issue reading the configuration.json file display a notification on the console.
		if(err) { log.error("There was an issue reading the settings configuration file."); }
		else {
			log.info("The settings configuration file has been successfully read.");
			// Define the proper window parameters based on whether a current configuration exists.
		    const configObj = JSON.parse(file);
		    if(configObj.current != undefined) {
		    	var primWinWidth = parseInt(configObj.current.primaryWindowWidth),
			    	primWinHeight = parseInt(configObj.current.primaryWindowHeight),
			    	primWinFullscreen = configObj.current.primaryWindowFullscreen,
			    	secWinWidth = parseInt(configObj.current.secondaryWindowWidth),
			    	secWinHeight = parseInt(configObj.current.secondaryWindowHeight),
			    	secWinFullscreen = configObj.current.secondaryWindowFullscreen;
		    }
		    else {
		    	var primWinWidth = parseInt(configObj.original.primaryWindowWidth),
			    	primWinHeight = parseInt(configObj.original.primaryWindowHeight),
			    	primWinFullscreen = configObj.original.primaryWindowFullscreen,
			    	secWinWidth = parseInt(configObj.original.secondaryWindowWidth),
			    	secWinHeight = parseInt(configObj.original.secondaryWindowHeight),
			    	secWinFullscreen = configObj.original.secondaryWindowFullscreen;
		    }
		    // Read the index.html file.
		    fs.readFile(path.join(__dirname, "pages", "dist", "index.html"), "UTF8", (issue, indexPage) => {
		    	// If there was an issue reading the index.html file display a notification on the console.
		    	if(issue) { log.error("There was an issue reading the index.html file."); }
		    	else {
		    		log.info("The index.html file has been successfully read.");
		    		// Update the href values of the css and js files referenced in the index.html file.
		    		const regCSS = new RegExp("../../styles/dist/styles.css", "g"),
						regJS = new RegExp("../../scripts/dist/frontEnd/", "g");
					indexPage = indexPage.replace(regCSS, path.join(basePath, "Trak", "localStyles", "styles.css"));
					indexPage = indexPage.replace(regJS, path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "scripts", "dist", "frontEnd", " ").trim());
					fs.writeFile(path.join(basePath, "Trak", "localPages", "index.html"), indexPage, "UTF8", prob => {
						// If there was an issue writing the index.html file display a notification on the console.
						if(prob) { log.error("There was an issue writing the index.html file to the localPages folder."); }
						else {
							log.info("The index.html file has been successfully rewritten to the localPages folder.");
							// Read the addRecord.html file.
							fs.readFile(path.join(__dirname, "pages", "dist", "addRecord.html"), "UTF8", (iss, addRecordPage) => {
								// If there was an issue reading the addRecord.html file display a notification on the console.
								if(iss) { log.error("There was an issue reading the addRecord.html file."); }
								else {
									log.info("The addRecord.html file has been successfully read.");
									// Update the href values of the css and js files along with src values associated to images referenced in the addRecord.html file.
									addRecordPage = addRecordPage.replace(regCSS, path.join(basePath, "Trak", "localStyles", "styles.css"));
									addRecordPage = addRecordPage.replace(regJS, path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "scripts", "dist", "frontEnd", " ").trim());
									addRecordPage = addRecordPage.replace(new RegExp("../../assets/animeDef.png", "g"), path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "assets", "animeDef.png"));
									fs.writeFile(path.join(basePath, "Trak", "localPages", "addRecord.html"), addRecordPage, "UTF8", problem => {
										// If there was an issue writing the addRecord.html file display a notification on the console.
										if(problem) { log.error("There was an issue writing the addRecord.html file to the localPages folder."); }
										else {
											log.info("The addRecord.html file has been successfully rewritten to the localPages folder.");
											// Read the styles.css file.
											fs.readFile(path.join(__dirname, "styles", "dist", "styles.css"), "UTF8", (err, stylesFile) => {
												// If there was an issue reading the styles.css file display a notification on the console.
												if(err) { log.error("There was an issue reading the application styles file."); }
												else {
													log.info("The styles.css file has been successfully read.");
													if(configObj.current != undefined) {
														// If a current configuration exists then apply the primary and secondary colors to the styles.css file.
														const reg1 = new RegExp(configObj.original.primaryColor.toLowerCase(), "g"),
															reg2 = new RegExp(configObj.original.secondaryColor.toLowerCase(), "g");
														stylesFile = stylesFile.replace(reg1, configObj.current.primaryColor);
														stylesFile = stylesFile.replace(reg2, configObj.current.secondaryColor);
													}
													fs.writeFile(path.join(basePath, "Trak", "localStyles", "styles.css"), stylesFile, "UTF8", err => {
														// If there was an issue writing the styles.css file display a notification on the console.
														if(err) { log.error("There was an issue writing the application styles file to the localStyles folder."); }
														else {
															log.info("The styles.css file has been successfully rewritten to the localStyles folder.");
															// Create the primary window.
														  	let primaryWindow = tools.createWindow("index", basePath, BrowserWindow, path, primWinWidth, primWinHeight, primWinFullscreen);
															primaryWindow.webContents.on("did-finish-load", () => {
																log.info("The index.html page is now loading.");
																primaryWindow.webContents.send("loadRows", primaryWindow.getContentSize()[1] - 800);
																tools.tutorialLoad(fs, path, log, primaryWindow, basePath);
																tools.checkForUpdate(os, semver, https, fs, path, basePath, primaryWindow);
															});
														  	// Create the system tray icon and menu. 
														  	log.info("The application is creating the tray menu.");
														  	tray = new Tray(path.join(__dirname, "/assets/logo.png"));
															tools.createTrayMenu("h", primaryWindow, tray, Menu);
															// Add all of the back-end listeners.
															appListeners.addListeners(app, BrowserWindow, path, fs, log, os, spawn, downloadRelease, semver, ExcelJS, https, exec, shell, ipc, zipper, tools, malScraper, primaryWindow, localPath, basePath, primWinWidth, primWinHeight, primWinFullscreen, secWinWidth, secWinHeight, secWinFullscreen);
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
		    	}
		    });
		}
	});
});



// Ensures the Electron app closes properly.
app.on("window-all-closed", () => {
	if(process.platform !== "darwin") {
    	app.quit();
  	}
});