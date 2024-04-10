/*

Declare all of the necessary variables.

	- app, BrowserWindow, Menu, Tray, and ipc provide the means to operate the Electron app.
	- fs and path provide the means to work with local files.
	- https provides the means to download files.
	- log provides the means to create application logs to keep track of what is going on.
	- os provides the means to get information on the user operating system.
	- tools provides a collection of local functions meant to help with writing files.
	- basePath is the path to the local settings data.
	- localPath is the path to the local user data.

*/
const { app, BrowserWindow, Menu, Tray } = require("electron"),
	ipc = require("electron").ipcMain,
	dev = process.argv.includes("--dev"),
	path = require("path"),
	fs = require("fs-extra"),
	log = require("electron-log"),
	tools = require("./scripts/dist/backEnd/tools"),
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
	let splashWindow = tools.createWindow("splash", basePath, BrowserWindow, fs, path, log, dev);
	splashWindow.webContents.on("did-finish-load", () => {
		// Update the splash screen to indicate that the tray is being created.
		splashWindow.webContents.send("loadBlink", 1);
		require("electron-context-menu")({
			"showSearchWithGoogle": true,
			"showSelectAll": true
		});
		// Update the splash screen to indicate that the default files and folders are being created.
		splashWindow.webContents.send("loadBlink", 2);
		// Create the configurations folder if it does not exist.
		if(!fs.existsSync(path.join(basePath, "Trak", "config", "assets"))) {
			fs.mkdirSync(path.join(basePath, "Trak", "config", "assets"), { "recursive": true });
		}
		// Create the notifications file if it does not exist.
		if(!fs.existsSync(path.join(basePath, "Trak", "config", "notifications.json"))) {
			fs.writeFileSync(path.join(basePath, "Trak", "config", "notifications.json"), JSON.stringify({"interval": 14, "notifications": []}), "UTF8");
		}
		// Create the associations file if it does not exist.
		if(!fs.existsSync(path.join(basePath, "Trak", "config", "associations.json"))) {
			fs.writeFileSync(path.join(basePath, "Trak", "config", "associations.json"), JSON.stringify({"associations": []}), "UTF8");
		}
		// Create the configuration file if it does not exist.
		if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
			log.info("Creating the default configuration file. To be located at " + path.join(basePath, "Trak", "config", "configuration.json"));
			const writeData = { "original": {
					"path": path.join(basePath, "Trak", "data"),
					"primaryColor": "#2A2A8E",
					"secondaryColor": "#D9D9DB",
					"primaryWindowWidth": 1000,
					"primaryWindowHeight": 800,
					"primaryWindowFullscreen": false,
					"secondaryWindowWidth": 1400,
					"secondaryWindowHeight": 1000,
					"secondaryWindowFullscreen": false,
					"icon": "grey",
					"update": true,
					"active": {
						"anime": true,
						"book": true,
						"film": true,
						"manga": true,
						"show": true
					}
				}
			};
			fs.writeFileSync(path.join(basePath, "Trak", "config", "configuration.json"), JSON.stringify(writeData), "UTF8");
		}
		else { tools.compatibilityCheck(fs, path, log, basePath); }
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
		// Update the splash screen to indicate that the necessary css and html files are being modified.
		splashWindow.webContents.send("loadBlink", 3);
		let updateCheck = false,
			splashCheck = false;
		// Load the user's preferred window sizes if they exist.
		fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
			// If there was an issue reading the configuration.json file display a notification on the console.
			if(err) { log.error("There was an issue reading the settings configuration file."); }
			else {
				log.info("The settings configuration file has been successfully read.");
				// Define the proper window parameters based on whether a current configuration exists.
			    const configObj = JSON.parse(file);
			    const categoryActiveArr = [
					configObj[configObj.current != undefined ? "current" : "original"].active.anime,
					configObj[configObj.current != undefined ? "current" : "original"].active.book,
					configObj[configObj.current != undefined ? "current" : "original"].active.film,
					configObj[configObj.current != undefined ? "current" : "original"].active.manga,
					configObj[configObj.current != undefined ? "current" : "original"].active.show,
				];
			    if(configObj.current != undefined) {
			    	var primWinWidth = parseInt(configObj.current.primaryWindowWidth),
				    	primWinHeight = parseInt(configObj.current.primaryWindowHeight),
				    	primWinFullscreen = configObj.current.primaryWindowFullscreen,
				    	secWinWidth = parseInt(configObj.current.secondaryWindowWidth),
				    	secWinHeight = parseInt(configObj.current.secondaryWindowHeight),
				    	secWinFullscreen = configObj.current.secondaryWindowFullscreen,
				    	iconChoice = configObj.current.icon,
				    	updateConfig = configObj.current.update,
				    	lightCondition = tools.lightOrDark(configObj.current.secondaryColor) == "light",
						darkCondition = tools.lightOrDark(configObj.current.primaryColor) == "dark";
			    }
			    else {
			    	var primWinWidth = parseInt(configObj.original.primaryWindowWidth),
				    	primWinHeight = parseInt(configObj.original.primaryWindowHeight),
				    	primWinFullscreen = configObj.original.primaryWindowFullscreen,
				    	secWinWidth = parseInt(configObj.original.secondaryWindowWidth),
				    	secWinHeight = parseInt(configObj.original.secondaryWindowHeight),
				    	secWinFullscreen = configObj.original.secondaryWindowFullscreen,
				    	iconChoice = configObj.original.icon,
				    	updateConfig = configObj.original.update,
				    	lightCondition = false,
				    	darkCondition = true;
			    }
			    fs.copyFileSync(path.join(__dirname, "assets", (darkCondition ? "white" : "black") + "Logo.png"), path.join(basePath, "Trak", "config", "assets", "logo.png"));
			    // Read the index.html file.
			    fs.readFile(path.join(__dirname, "pages", "dist", "index.html"), "UTF8", (issue, indexPage) => {
			    	// If there was an issue reading the index.html file display a notification on the console.
			    	if(issue) { log.error("There was an issue reading the index.html file."); }
			    	else {
			    		log.info("The index.html file has been successfully read.");
			    		// Update the href values of the css and js files referenced in the index.html file and icon references as needed.
			    		const regCSS = new RegExp("../../styles/dist/styles.css", "g"),
			    			regIcons = new RegExp("../../assets/titlebarIcons", "g"),
							regJS = new RegExp("../../scripts/dist/frontEnd/", "g");
						indexPage = indexPage.replace(regCSS, path.join(basePath, "Trak", "localStyles", "styles.css"));
						indexPage = indexPage.replace(regJS, path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "scripts", "dist", "frontEnd", " ").trim());
						indexPage = indexPage.replace(new RegExp("../../assets/logo.png", "g"), path.join(basePath, "Trak", "config", "assets", "logo.png"));
						indexPage = indexPage.replace(regIcons, path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "assets", "titlebarIcons"));
						if(!darkCondition && configObj.current != undefined) { indexPage = indexPage.replace(new RegExp("-w-", "g"), "-k-"); }
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
										addRecordPage = addRecordPage.replace(new RegExp("../../assets/imgDef.png", "g"), path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "assets", "imgDef.png"));
										addRecordPage = addRecordPage.replace(regIcons, path.join(__dirname.replace(new RegExp(" ", "g"), "%20"), "assets", "titlebarIcons"));
										if(!darkCondition && configObj.current != undefined) { addRecordPage = addRecordPage.replace(new RegExp("-w-", "g"), "-k-"); }
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
															// If a current configuration exists then edit the appropriate styles in the styles.css file.
															const reg1 = new RegExp(configObj.original.primaryColor.toLowerCase(), "g"),
																reg2 = new RegExp(configObj.original.secondaryColor.toLowerCase(), "g"),
																reg3 = new RegExp("color:black", "g"),
																reg4 = new RegExp(".material-icons{color:white", "g"),
																reg5 = new RegExp(".relatedContentBtn i{color:white", "g"),
																reg6 = new RegExp("border-bottom-color:black", "g"),
																reg7 = new RegExp("border-right-color:black", "g"),
																reg8 = new RegExp("fill:black", "g"),
																reg9 = new RegExp("color-scheme:light", "g");
															stylesFile = stylesFile.replace(reg1, configObj.current.primaryColor);
															stylesFile = stylesFile.replace(reg2, configObj.current.secondaryColor);
															stylesFile = stylesFile.replace(reg3, lightCondition ? "color:black" : "color:white");
															stylesFile = stylesFile.replace(reg4, darkCondition ? ".material-icons{color:white" : ".material-icons{color:black");
															stylesFile = stylesFile.replace(reg5, darkCondition ? ".relatedContentBtn i{color:white" : ".relatedContentBtn i{color:black");
															stylesFile = stylesFile.replace(reg6, lightCondition ? "border-bottom-color:black" : "border-bottom-color:white");
															stylesFile = stylesFile.replace(reg7, lightCondition ? "border-right-color:black" : "border-right-color:white");
															stylesFile = stylesFile.replace(reg8, lightCondition ? "fill:black" : "fill:white");
															stylesFile = stylesFile.replace(reg9, lightCondition ? "color-scheme:light" : "color-scheme:dark");
															if(categoryActiveArr.filter(elem => elem == true).length == 1) {
																stylesFile += "#addRecordsNav{display:none;}";
															}
														}
														fs.writeFile(path.join(basePath, "Trak", "localStyles", "styles.css"), stylesFile, "UTF8", err => {
															// If there was an issue writing the styles.css file display a notification on the console.
															if(err) { log.error("There was an issue writing the application styles file to the localStyles folder."); }
															else {
																log.info("The styles.css file has been successfully rewritten to the localStyles folder.");
																// Update the splash screen to indicate that the primary window is being created.
																splashWindow.webContents.send("loadBlink", 4);
																// Load the libraries used for fetching record details.
																const goodreadsScraper = require("goodreads-scraper"),
																	malScraper = require("mal-scraper"),
																	movier = require("movier");
																// Create the primary window.
															  	let primaryWindow = tools.createWindow("index", basePath, BrowserWindow, fs, path, log, dev, primWinWidth, primWinHeight, primWinFullscreen);
															  	// Focus the application on the splash window.
																splashWindow.focus();
																// Proceed once the primary window has finished loading.
																primaryWindow.webContents.on("did-finish-load", () => {
																	// If the splash screen is still open update it.
																	if(splashCheck == false) {
																		splashWindow.webContents.send("loadBlink", 5);
																		splashCheck = true;
																	}
																	// Load the library records on the primary window.
																	primaryWindow.webContents.send("loadRows", [true, primaryWindow.getContentSize()[1] - 800]);
																	primaryWindow.webContents.send("activeCategories", categoryActiveArr);
																	// Check for an available application update.
																	if(updateCheck == false && updateConfig == true) {
																		tools.checkForUpdate(require("os"), require("https"), fs, path, log, basePath, primaryWindow);
																		updateCheck = true;
																	}
																});
															  	// Create the system tray icon and menu. 
															  	log.info("The application is creating the tray menu.");
															  	tray = new Tray(path.join(__dirname, "assets", iconChoice + "Logo.png"));
																tools.createTrayMenu("h", primaryWindow, tray, Menu);
																// Add all of the back-end listeners.
																require("./scripts/dist/backEnd/appListeners").addListeners(app, BrowserWindow, path, fs, log, dev, ipc, tools, categoryActiveArr, goodreadsScraper, malScraper, movier,
																	updateCheck, primaryWindow, splashWindow, localPath, basePath, primWinWidth, primWinHeight, primWinFullscreen, secWinWidth, secWinHeight, secWinFullscreen);
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
}).catch(err => { log.error("The application failed to start."); console.log(err); });



// Ensures the Electron app closes properly.
app.on("window-all-closed", () => {
	if(process.platform !== "darwin") {
    	app.quit();
  	}
});