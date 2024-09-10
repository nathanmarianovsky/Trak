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
const { app, BrowserWindow, Menu, shell, Tray } = require("electron"),
	ipc = require("electron").ipcMain,
	dev = process.argv.includes("--dev"),
	path = require("path"),
	fs = require("fs-extra"),
	log = require("electron-log"),
	tools = require("./scripts/dist/backEnd/tools"),
	linuxHome = process.env.HOME.split("/snap/")[0],
	basePath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : linuxHome + (process.env.HOME.includes("snap") ? "/snap/trak/common" : "/.local/share"));
if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
	var localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : linuxHome + (process.env.HOME.includes("snap") ? "/snap/trak/common" : "/.local/share"));
}
else {
	let configObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
	var localPath = configObj.current != undefined
		? configObj.current.path.substring(0, configObj.current.path.length - 10)
		: configObj.original.path.substring(0, configObj.original.path.length - 10);
}



/*

Processes the throwing of an error by reading the logs file and providing the front end with it.

   - err is an any error object thrown by the application load.

*/
const errHandle = err => {
	if(err) { log.error("The application failed to start. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
	let curWin = BrowserWindow.getFocusedWindow(),
		logPth = path.join(basePath, "Trak", "logs", "main.log");
	fs.readFile(logPth, "UTF8", (logErr, logFle) => {
		if(logErr == null) {
			let lgArr = logFle.split("\n");
			// Remove the last element which is an empty string.
            lgArr.pop();
            // Iterate through the lines to determine the last application load.
            let ind = lgArr.length - 1;
            for(; ind >= 0; ind--) {
                if(lgArr[ind].includes("The application is starting.")) { break; }
            }
			curWin.webContents.send("loadFail", [lgArr.slice(ind), logPth]);
		}
		else {
			curWin.webContents.send("loadFail", []);
		}
	});
	// Handles the closing of the splash window.
	ipc.on("closeSplash", event => curWin.close());
};



// Make an entry in the logs to indicate that the application is starting up.
log.info("The application is starting.");



// Loads the Electron app by creating the primary window. 
app.whenReady().then(() => {
	const splashWindow = tools.createWindow("splash", basePath, BrowserWindow, fs, path, log, dev);
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
		const assetsDir = path.join(basePath, "Trak", "config", "assets");
		fs.mkdir(assetsDir, { "recursive": true }, assetsDirErr => {
			// If there was an issue in creating the configuration folders report it to the logs.
			if(assetsDirErr) {
				log.error("There was an issue in creating the configuration folders to be located at " + assetsDir + ".");
				errHandle(assetsDirErr);
			}
			else {
				log.info("The configuration folders have been successfully created.");
				// If the data folder does not exist, then create it.
				const dataDir = path.join(basePath, "Trak", "data");
				fs.mkdir(dataDir, { "recursive": true }, dataDirErr => {
					// If there was an issue in creating the library data folder report it to the logs.
					if(dataDirErr) {
						log.error("There was an issue in creating the library data folder to be located at " + dataDir + ".");
						errHandle(dataDirErr);
					}
					else {
						log.info("The library data folder has been successfully created.");
						// Create the notifications file if it does not exist.
						if(!fs.existsSync(path.join(basePath, "Trak", "config", "notifications.json"))) {
							fs.writeFileSync(path.join(basePath, "Trak", "config", "notifications.json"), JSON.stringify({"interval": 14, "notifications": []}), "UTF8");
						}
						// Create the associations file if it does not exist or move it for legacy support.
						const oldPath = path.join(basePath, "Trak", "config", "associations.json"),
							newPath = path.join(basePath, "Trak", "data", "associations.json");
						if(fs.existsSync(oldPath)) {
							fs.rename(oldPath, newPath, assocErr => {
								if(assocErr) { log.error("There was an issue in moving the associations.json file from " + oldPath + " to " + newPath + ". Error Type: " + assocErr.name + ". Error Message: " + assocErr.message + "."); }
								else { log.info("The associations.json file was successfully moved from " + oldPath + " to " + newPath + "."); }
							});
						}
						else if(!fs.existsSync(path.join(basePath, "Trak", "data", "associations.json"))) {
							fs.writeFileSync(path.join(basePath, "Trak", "data", "associations.json"), JSON.stringify({"associations": []}), "UTF8");
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
									"autosave": "3",
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
						const localPagesDir = path.join(basePath, "Trak", "localPages");
						fs.mkdir(localPagesDir, { "recursive": true }, localPagesDirErr => {
							// If there was an issue in creating the localPages folder report it to the logs.
							if(localPagesDirErr) {
								log.error("There was an issue in creating the localPages folder to be located at " + localPagesDir + ".");
								errHandle(localPagesDirErr);
							}
							else {
								log.info("The localPages folder has been successfully created.");
								// Create the localStyles folder if it does not exist.
								const localStylesDir = path.join(basePath, "Trak", "localStyles");
								fs.mkdir(localStylesDir, { "recursive": true }, localStylesDirErr => {
									// If there was an issue in creating the localStyles folder report it to the logs.
									if(localStylesDirErr) {
										log.error("There was an issue in creating the localStyles folder to be located at " + localStylesDir + ".");
										errHandle(localStylesDirErr);
									}
									else {
										log.info("The localStyles folder has been successfully created.");
										// Update the splash screen to indicate that the necessary css and html files are being modified.
										splashWindow.webContents.send("loadBlink", 3);
										let updateCheck = false,
											splashCheck = false;
										// Load the user's preferred window sizes if they exist.
										fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
											// If there was an issue reading the configuration.json file display a notification on the console.
											if(err) {
												log.error("There was an issue reading the settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
												errHandle(err);
											}
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
											    fs.copyFile(path.join(__dirname, "assets", (darkCondition ? "white" : "black") + "Logo.png"), path.join(basePath, "Trak", "config", "assets", "logo.png"), assetsCopyErr => {
											    	// If there was an issue copying the logo asset report it to the logs.
													if(assetsCopyErr) {
														log.error("There was an issue copying the preferred icon asset file. Error Type: " + assetsCopyErr.name + ". Error Message: " + assetsCopyErr.message + ".");
														errHandle(assetsCopyErr);
													}
													else {
														log.info("The preferred icon asset file has been successfully copied over.")
													    // Read the index.html file.
													    fs.readFile(path.join(__dirname, "pages", "dist", "index.html"), "UTF8", (issue, indexPage) => {
													    	// If there was an issue reading the index.html file display a notification on the console.
													    	if(issue) {
													    		log.error("There was an issue reading the index.html file. Error Type: " + issue.name + ". Error Message: " + issue.message + ".");
													    		errHandle(issue);
													    	}
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
																	if(prob) {
																		log.error("There was an issue writing the index.html file to the localPages folder. Error Type: " + prob.name + ". Error Message: " + prob.message + ".");
																		errHandle(prob);
																	}
																	else {
																		log.info("The index.html file has been successfully rewritten to the localPages folder.");
																		// Read the addRecord.html file.
																		fs.readFile(path.join(__dirname, "pages", "dist", "addRecord.html"), "UTF8", (iss, addRecordPage) => {
																			// If there was an issue reading the addRecord.html file display a notification on the console.
																			if(iss) {
																				log.error("There was an issue reading the addRecord.html file. Error Type: " + iss.name + ". Error Message: " + iss.message + ".");
																				errHandle(iss);
																			}
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
																					if(problem) {
																						log.error("There was an issue writing the addRecord.html file to the localPages folder. Error Type: " + problem.name + ". Error Message: " + problem.message + ".");
																						errHandle(problem);
																					}
																					else {
																						log.info("The addRecord.html file has been successfully rewritten to the localPages folder.");
																						// Read the styles.css file.
																						fs.readFile(path.join(__dirname, "styles", "dist", "styles.css"), "UTF8", (readErr, stylesFile) => {
																							// If there was an issue reading the styles.css file display a notification on the console.
																							if(readErr) {
																								log.error("There was an issue reading the application styles file. Error Type: " + readErr.name + ". Error Message: " + readErr.message + ".");
																								errHandle(readErr);
																							}
																							else {
																								log.info("The styles.css file has been successfully read.");
																								if(configObj.current != undefined) {
																									// If a current configuration exists then edit the appropriate styles in the styles.css file.
																									const reg1 = new RegExp(configObj.original.primaryColor.toLowerCase(), "g"),
																										reg2 = new RegExp(configObj.original.secondaryColor.toLowerCase(), "g"),
																										reg3 = new RegExp("color:black", "g"),
																										reg4 = new RegExp(".material-icons{color:white", "g"),
																										reg5 = new RegExp("nav .tap-target-wave .material-icons{color:black", "g"),
																										reg6 = new RegExp(".relatedContentBtn i{color:white", "g"),
																										reg7 = new RegExp("border-bottom-color:black", "g"),
																										reg8 = new RegExp("border-right-color:black", "g"),
																										reg9 = new RegExp("fill:black", "g"),
																										reg10 = new RegExp("color-scheme:light", "g"),
																										reg11 = new RegExp(".autocomplete-content li .highlight{color:#444", "g"),
																										reg12 = new RegExp(".bookmarkInfoIcon{color:black", "g");
																									stylesFile = stylesFile.replace(reg1, configObj.current.primaryColor);
																									stylesFile = stylesFile.replace(reg2, configObj.current.secondaryColor);
																									stylesFile = stylesFile.replace(reg3, lightCondition ? "color:black" : "color:white");
																									stylesFile = stylesFile.replace(reg4, darkCondition ? ".material-icons{color:white" : ".material-icons{color:black");
																									stylesFile = stylesFile.replace(reg5, darkCondition ? "nav .tap-target-wave .material-icons{color:black" : "nav .tap-target-wave .material-icons{color:white");
																									stylesFile = stylesFile.replace(reg6, darkCondition ? ".relatedContentBtn i{color:white" : ".relatedContentBtn i{color:black");
																									stylesFile = stylesFile.replace(reg7, lightCondition ? "border-bottom-color:black" : "border-bottom-color:white");
																									stylesFile = stylesFile.replace(reg8, lightCondition ? "border-right-color:black" : "border-right-color:white");
																									stylesFile = stylesFile.replace(reg9, lightCondition ? "fill:black" : "fill:white");
																									stylesFile = stylesFile.replace(reg10, lightCondition ? "color-scheme:light" : "color-scheme:dark");
																									stylesFile = stylesFile.replace(reg11, lightCondition ? ".autocomplete-content li .highlight{color:#444" : ".autocomplete-content li .highlight{color:" + tools.invertColor("#444"));
																									stylesFile = stylesFile.replace(reg12, darkCondition ? ".bookmarkInfoIcon{color:white" : ".bookmarkInfoIcon{color:black");
																									if(categoryActiveArr.filter(elem => elem == true).length == 1) {
																										stylesFile += "#addRecordsNav{display:none;}";
																									}
																								}
																								fs.writeFile(path.join(basePath, "Trak", "localStyles", "styles.css"), stylesFile, "UTF8", writeErr => {
																									// If there was an issue writing the styles.css file display a notification on the console.
																									if(writeErr) {
																										log.error("There was an issue writing the application styles file to the localStyles folder. Error Type: " + writeErr.name + ". Error Message: " + writeErr.message + ".");
																										errHandle(writeErr);
																									}
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
																											if(updateCheck == false && updateConfig == true && fs.existsSync("./scripts/dist/backEnd/update.js")) {
																												require("./scripts/dist/backEnd/update").checkForUpdate(require("os"), require("https"), fs, path, log, basePath, primaryWindow);
																												updateCheck = true;
																											}
																										});
																									  	// Create the system tray icon and menu. 
																									  	log.info("The application is creating the tray menu.");
																									  	let tray = new Tray(path.join(__dirname, "assets", iconChoice + "Logo.png"));
																										tools.createTrayMenu("h", primaryWindow, tray, Menu);
																										// Add all of the back-end listeners.
																										require("./scripts/dist/backEnd/appListeners").addListeners(app, shell, BrowserWindow, path, fs, log, dev, ipc, tools, categoryActiveArr, goodreadsScraper, malScraper, movier,
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
}).catch(errHandle);



// Ensures the Electron app closes properly.
app.on("window-all-closed", () => {
	if(process.platform !== "darwin") {
    	app.quit();
  	}
});