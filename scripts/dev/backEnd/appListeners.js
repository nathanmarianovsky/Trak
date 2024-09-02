/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - addConfigurationListeners: Driver function for adding all configuration listeners.
   - addTitlebarListeners: Driver function for adding all titlebar listeners.
   - addBasicListeners: Driver function for adding all basic listeners.
   - addRecordListeners: Driver function for adding all listeners associated to the maintenance of records.
   - addAnimeListeners: Driver function for adding all anime listeners.
   - addBookListeners: Driver function for adding all book listeners.
   - addMangaListeners: Driver function for adding all manga listeners.
   - addDatabaseListeners: Driver function for adding all database listeners.
   - addSettingsListeners: Driver function for adding all settings listeners.
   - addUpdateListeners: Driver function for adding all update listeners.
   - addLogListeners: Driver function for adding all log listeners.
   - addHelperListeners: Driver function for adding all helper listeners.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Driver function for adding all configuration listeners.

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- originalPath is the original path to the local user data.

*/
exports.addConfigurationListeners = (path, fs, log, ipc, originalPath) => {
	// Provides the application configuration data to the front-end.
	ipc.on("getConfigurations", event => {
		fs.readFile(path.join(originalPath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
			event.sender.send("sentConfigurations", err ? "" : file);
			if(err) { log.error("There was an issue reading the application settings configuration file. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
		});
	});

	// Provides the application notifications data to the front-end.
	ipc.on("getNotifications", event => {
		fs.readFile(path.join(originalPath, "Trak", "config", "notifications.json"), "UTF8", (err, file) => {
			event.sender.send("sentNotifications", err ? "" : file);
			if(err) { log.error("There was an issue reading the application notifications file. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
		});
	});

	// Provides the application tutorial configuration to the front-end.
	ipc.on("getTutorial", event => {
		if(fs.existsSync(path.join(originalPath, "Trak", "config", "tutorial.json"))) {
			fs.readFile(path.join(originalPath, "Trak", "config", "tutorial.json"), "UTF8", (err, file) => {
				event.sender.send("sentTutorial", err ? "" : file);
				if(err) { log.error("There was an issue reading the application settings tutorial file. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
			});
		}
		else {
			const fle = JSON.stringify({"introduction": true});
			fs.writeFileSync(path.join(originalPath, "Trak", "config", "tutorial.json"), fle, "UTF8");
			event.sender.send("sentTutorial", fle);
		}
	});

	// Provides the application version number to the front-end.
	ipc.on("getVersion", event => {
		fs.readFile(path.join(__dirname, "../../../package.json"), "UTF8", (err, file) => {
			event.sender.send("sentVersion", err ? "" : file);
			if(err) { log.error("There was an issue reading the application package.json file. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
		});
	});
};



/*

Driver function for adding all titlebar listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.

*/
exports.addTitlebarListeners = (BrowserWindow, ipc) => {
	// Handles the minimizing of a window.
	ipc.on("minimizeWindow", event => BrowserWindow.getFocusedWindow().minimize());

	// Handles the maximizing of a window.
	ipc.on("maximizeWindow", event => BrowserWindow.getFocusedWindow().maximize());

	// Handles the restoring of a window.
	ipc.on("restoreWindow", event => BrowserWindow.getFocusedWindow().unmaximize());

	// Handles the closing of a window.
	ipc.on("closeWindow", event => BrowserWindow.getFocusedWindow().close());
};



/*

Driver function for adding all basic listeners.

	- app, shell, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- hiddenArr is an array containing booleans which indicate whether a category type is to be hidden in the application.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- loadWindow is an object referencing the splash window of the Electron app.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, and primaryWindowFullscreen are the window parameters.

*/
exports.addBasicListeners = (app, shell, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, updateCondition, mainWindow, loadWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen) => {
	// Close the splash screen once the application is ready.
	ipc.once("removeSplash", event => {
		// Update the splash screen to indicate that the application has finished loading and is ready.
		loadWindow.webContents.send("loadBlink", 6);
		// After a small delay put the primary window on display and destroy the splash screen.
		setTimeout(() => {
			mainWindow.focus();
			loadWindow.destroy();
		}, 1000);
	});

	// Send a request to the front-end to initialize the application tutorial.
	ipc.once("tutorialReady", ev => {
		tools.tutorialLoad(fs, path, log, BrowserWindow.getFocusedWindow(), originalPath);
	});

	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
    		// Create a primary window.
	   		let win = tools.createWindow("index", originalPath, BrowserWindow, fs, path, log, dev, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	   		// Proceed once the window has finished loading.
	   		win.webContents.on("did-finish-load", () => {
	   			// Send a request to the front-end to initialize the loading of library records on the primary window.
				win.webContents.send("loadRows", win.getContentSize()[1] - 800);
				win.webContents.send("activeCategories", hiddenArr);
  			});
    	}
  	});

  	// Close the Electron app if the primary window is closed.
	let logCheck = false;
  	mainWindow.on("close", () => {
  		// Log that the application is quitting, if necessary.
  		if(logCheck == false) {
  			log.info("The application is quitting.");
  			logCheck = true;
  		}
  		// Quit the application.
    	mainWindow = null;
    	app.quit();
    });

    // Handle the load of the home page.
  	ipc.on("home", event => {
  		// Have the primary window load the corresponding html structure.
  		mainWindow.loadFile(path.join(originalPath, "Trak", "localPages", "index.html"));
  		// Proceed once the window has finished loading.
  		mainWindow.webContents.on("did-finish-load", () => {
  			// Send a request to the front-end to initialize the loading of library records on the primary window.
  			mainWindow.webContents.send("loadRows", mainWindow.getContentSize()[1] - 800);
  		});
  	});

  	// Handles the opening of the library records folder.
  	ipc.on("libraryFolder", event => {
  		shell.openPath(path.join(originalPath, "Trak", "data"));
  		log.info("The folder containing the library records has been opened.");
		event.sender.send("libraryFolderSuccess");
  	});

  	const bookmarkOperations = ["Add", "Remove"];
  	for(let y = 0; y < bookmarkOperations.length; y++) {
  		// Handles the bookmarking/unbookmarking of multiple records simultaneously.
	  	ipc.on(bookmarkOperations[y].toLowerCase() + "Bookmark", (event, list) => {
	  		for(let m = 0; m < list.length; m++) {
	  			let curFile = JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "data", list[m], "data.json"), "UTF8"));
	  			if(bookmarkOperations[y] == "Add") {
	  				curFile.bookmark = true;
	  			}
	  			else if(bookmarkOperations[y] == "Remove") {
	  				curFile.bookmark = false;
	  			}
	  			log.info("Bookmarking the " + curFile.category + " " + curFile.name);
	  			fs.writeFileSync(path.join(originalPath, "Trak", "data", list[m], "data.json"), JSON.stringify(curFile), "UTF8");
	  		}
	  		mainWindow.reload();
			setTimeout(() => { mainWindow.webContents.send("bookmark" + bookmarkOperations[y] + "Success"); }, 500);
	  	});
  	}

  	// Handle the update of the notifications configuration file.
    ipc.on("notificationsSave", (event, submissionContent) => {
    	// Define the path to the notifications configuration file.
    	const notificationsPath = path.join(originalPath, "Trak", "config", "notifications.json");
    	// Read the notifications configuration file.
    	fs.readFile(notificationsPath, "UTF8", (err, file) => {
    		// If an error occured in reading the notifications configuration file then log it and notify the user.
    		if(err) {
        		log.error("There was an issue reading the notifications configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("notificationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the list of current notifications and the array which will hold indices of notifications to be removed.
        		const currentNotificationsFile = JSON.parse(file),
        			currentNotifications = currentNotificationsFile.notifications.map(a => ({...a})),
        			removalList = [];
        		// Iterate through the list of submitted notifications from the front-end request.
        		for(let u = 0; u < submissionContent.length; u++) {
        			let v = 0;
        			// Iterate through the list of current notifications in the notifications configuration file.
        			for(; v < currentNotificationsFile.notifications.length; v++) {
        				// If a submitted notification already exists break out of the loop.
        				if(currentNotificationsFile.notifications[v].id == submissionContent[u][0]
        					&& currentNotificationsFile.notifications[v].text == submissionContent[u][3]
        					&& currentNotificationsFile.notifications[v].date == submissionContent[u][4]) { break; }
        				// Otherwise, if a record no longer exists corresponding to the notification or the notification expired remove the record.
        				else if(!fs.existsSync(path.join(originalPath, "Trak", "data", currentNotificationsFile.notifications[v].id, "data.json"))
        					|| (new Date(currentNotificationsFile.notifications[v].date)).getTime() < (new Date()).getTime()) { removalList.push(v); }
        			}
        			// If no current notification matched up to the one submitted, then create a new notification.
        			if(v == currentNotificationsFile.notifications.length) {
        				currentNotifications.push({
        					"id": submissionContent[u][0],
        					"category": submissionContent[u][1],
        					"name": submissionContent[u][2],
        					"text": submissionContent[u][3],
        					"date": submissionContent[u][4],
        					"img": submissionContent[u][5],
        					"hidden": false,
        					"snooze": ""
        				});
        			}
        			// Otherwise, if a submitted notification already exists simply update the necessary parameters that expect a change.
        			else {
        				currentNotifications[v].date = submissionContent[u][4];
        				currentNotifications[v].img = submissionContent[u][5];
        				if(submissionContent[u][8] == false) {
        					currentNotifications[v].hidden = submissionContent[u][6];
        					currentNotifications[v].snooze = submissionContent[u][7];
        				}
        			}
        		}
        		// Remove the notifications marked for removal.
        		removalList.forEach(delIndex => currentNotifications.splice(delIndex, 1));
        		// Sort the notifications based on a record's release/start date.
        		currentNotifications.sort((lhs, rhs) => (new Date(lhs.date)).getTime() - (new Date(rhs.date)).getTime());
        		// Set the notifications to the modified list.
        		currentNotificationsFile.notifications = currentNotifications;
        		// Write the new notifications to the notifications configuration file.
        		fs.writeFile(notificationsPath, JSON.stringify(currentNotificationsFile), "UTF8", er => {
        			// If an error occured in writing the notifications configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the notifications configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
        				event.sender.send("notificationsFileWriteFailure");
        			}
        			// Otherwise, send a request to the front-end to display the notifications, if any exist.
        			else {
        				event.sender.send("notificationsReady", JSON.stringify(currentNotificationsFile));
        			}
        		});
        	}
    	});
    });

	// Handle the update of the notifications interval in the notifications configuration file.
	ipc.on("notificationsIntervalSave", (event, intervalSubmission) => {
  		// Define the path to the notifications configuration file.
  		const notificationsPath = path.join(originalPath, "Trak", "config", "notifications.json");
		// Read the notifications configuration file.
  		fs.readFile(notificationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the notifications configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the notifications configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("notificationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the current notifications configuration setup and modfiy the interval accordingly.
        		const curFile = JSON.parse(file);
        		curFile.interval = parseInt(intervalSubmission);
        		// Write the new interval to the notifications configuration file.
        		fs.writeFile(notificationsPath, JSON.stringify(curFile), "UTF8", er => {
        			// If an error occured in writing the notifications configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the notifications configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
        				event.sender.send("notificationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});

  	// Handle the update of the associations configuration file.
  	ipc.on("associationsSave", (event, submissionArr) => {
  		// Define the path to the associations configuration file.
  		const associationsPath = path.join(originalPath, "Trak", "data", "associations.json");
		// Read the associations configuration file.
  		fs.readFile(associationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the associations configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the associations configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("associationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the list of current associations and the id of the primary record submitted.
        		const associationsFileList = JSON.parse(file).associations,
        			focusName = submissionArr[0] + "-" + tools.formatFolderName(submissionArr[1]);
    			let focusItem = submissionArr[3] != "" ? submissionArr[3] : focusName + "-"
    				+ (fs.readdirSync(path.join(originalPath, "Trak", "data")).filter(file => fs.statSync(path.join(originalPath, "Trak", "data", file)).isDirectory() && file.includes(focusName)).length - 1);
        		let w = 0;
        		// Iterate through the list of current associations.
        		for(; w < associationsFileList.length; w++) {
        			// If the current association contains any of the records in the submitted association then update the current association.
        			if(associationsFileList[w].includes(focusItem) || associationsFileList[w].some(r => submissionArr[2].includes(r))) {
        				associationsFileList[w] = [...new Set([focusItem].concat(submissionArr[2]))]
        					.sort((a, b) => a.split("-").slice(1).join("-").localeCompare(b.split("-").slice(1).join("-")));
        				break;
        			}
        		}
        		// Otherwise, if no association was found to contain any of the records in the submitted association create a new association.
        		if(w == associationsFileList.length) {
        			associationsFileList.push([focusItem].concat(submissionArr[2]).sort((a, b) => a.split("-").slice(1).join("-").localeCompare(b.split("-").slice(1).join("-"))))
        		}
        		// Write the new associations to the associations configuration file.
        		fs.writeFile(associationsPath, JSON.stringify({"associations": associationsFileList.filter(arrElem => arrElem.length > 1 && !arrElem.every( (val, i, arr) => val === arr[0] ))}), "UTF8", er => {
        			// If an error occured in writing the associations configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the associations configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
        				event.sender.send("associationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});

  	// Handle the opening of store links in the default browser.
  	ipc.on("openStoreLink", (event, submissionArr) => {
  		// Define the external link depending on what store the user desires to search.
  		let externalLink = "";
  		if(submissionArr[0] == "Amazon") {
  			externalLink = "https://www.amazon.com/s?k=";
  		}
  		else if(submissionArr[0] == "Goodreads") {
  			externalLink = "https://www.goodreads.com/search?query=";
  		}
  		// Replace all whitespace in the store query with plus signs.
  		externalLink += submissionArr[1].replace(/ /g, "+");
  		log.info("Opening the store page " + externalLink + " in the default browser.");
  		// Open the external link.
  		require("electron").shell.openExternal(externalLink);
  	});
};



/*

Driver function for adding all listeners associated to the maintenance of records.

	- shell, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- hiddenArr is an array containing booleans which indicate whether a category type is to be hidden in the application.
	- goodreadsScraper, malScraper, and movier provide the means to obtain record details from goodreads, myanimelist, or imdb, respectively.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addRecordListeners = (shell, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of the user data directory.
	ipc.on("getDataPath", event => {
		event.sender.send("sentDataPath", dataPath);
	});

	// Create the listeners for adding and updating library records.
	const operationsArr = ["Add", "Update"];
	for(let p = 0; p < operationsArr.length; p++) {
		// Handles the load of the addRecord.html page for the update of a record.
	  	ipc.on(operationsArr[p].toLowerCase() + "Record", (event, info) => {
	  		// Have the secondary window load the corresponding html structure.
	  		let secondaryWin = tools.createWindow("addRecord", originalPath, BrowserWindow, fs, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
			// Proceed once the window has finished loading.
	  		secondaryWin.webContents.on("did-finish-load", () => {
	  			// Send a request to the front-end if the tutorial is chosen to be shown.
	  			if(info[0] == true) {
	  				log.info("Loading the application tutorial for the addRecord.html page.");
	  				secondaryWin.webContents.send("addIntroduction");
	  			}
	  			// Send a request to the update which record categories are displayed according to the application settings.
	  			secondaryWin.webContents.send("activeCategories", hiddenArr);
	  			// Send a request to display the associated content for adding a new record or updating an existing one.
				secondaryWin.webContents.send("record" + operationsArr[p] + "Info", info[1]);
	  		});
	  	});
	}

  	// Save the record upon a request from the front-end.
	ipc.on("performSave", (event, submission) => {
		require("./" + submission[1][0].toLowerCase() + "Tools")[submission[1][0].toLowerCase() + (submission[0] == true ? "Update" : "Add")]
			(BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission[1], submission[2], submission[3]);
	});

  	// Handles the deletion of multiple records and updates the associations configuration file accodingly.
  	ipc.on("removeRecords", (event, list) => {
  		// Remove the desired records.
  		tools.removeRecords(log, BrowserWindow.getFocusedWindow(), dataPath, fs, path, list);
  		// Define the path to the associations configuration file.
  		const associationsPath = path.join(originalPath, "Trak", "data", "associations.json"),
  			notificationsPath = path.join(originalPath, "Trak", "config", "notifications.json");
  		// Read the associations configuration file.
  		fs.readFile(associationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the associations configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the associations configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("associationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the current list of associations.
	  			let associationsLst = JSON.parse(file).associations;
	  			// Iterate through the list of records which are being removed.
	  			for(let u = 0; u < list.length; u++) {
	  				// Iterate through the list of current associations.
	  				for(let v = 0; v < associationsLst.length; v++) {
	  					// If an association is found to contain a record that is being removed then it's removed from the association.
	  					if(associationsLst[v].includes(list[u])) {
	  						associationsLst[v].splice(associationsLst[v].indexOf(list[u]), 1);
	  						break;
	  					}
	  				}
	  			}
	  			// Write the new associations to the associations configuration file.
	  			fs.writeFile(associationsPath, JSON.stringify({"associations": associationsLst}), "UTF8", er => {
	  				// If an error occured in writing the associations configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the associations configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
        				event.sender.send("associationsFileWriteFailure");
        			}
        		});
        	}
  		});
  		// Read the notifications configuration file.
  		fs.readFile(notificationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the notifications configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the notifications configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("notificationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the current list of notifications.
	  			let notificationsFile = JSON.parse(file),
	  				indexArr = [];
	  			// Iterate through the list of records which are being removed.
	  			for(let u = 0; u < list.length; u++) {
	  				// Iterate through the list of current notifications.
	  				for(let v = 0; v < notificationsFile.notifications.length; v++) {
	  					// If a notification is found to be associated to a record that is being removed then it's removed from the notifications.
	  					if(notificationsFile.notifications[v].id == list[u]) {
	  						notificationsFile.notifications.splice(v, 1);
	  						break;
	  					}
	  				}
	  			}
	  			// Write the new notifications to the notifications configuration file.
	  			fs.writeFile(notificationsPath, JSON.stringify(notificationsFile), "UTF8", er => {
	  				// If an error occured in writing the notifications configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the notifications configuration file. Error Type: " + er.name + ". Error Message: " + er.message + ".");
        				event.sender.send("notificationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, params) => {
		shell.openPath(path.join(dataPath, "Trak", "data", params[0], "assets"));
		// Log that the assets folder was opened and notify the user.
		log.info("The application successfully opened the folder directory " + path.join(dataPath, "Trak", "data", params[0], "assets") + ".");
		event.sender.send("recordFilesSuccess", params[1]);
	});

	// Handles the process of obtaining a library record based on a folder name.
	ipc.on("getLibraryRecord", (event, submissionArr) => {
		// Read the data file associated to the library record.
		fs.readFile(path.join(originalPath, "Trak", "data", submissionArr[0], "data.json"), "UTF8", (err, file) => {
			// Send the record data to the front-end.
			event.sender.send("sentLibraryRecord" + submissionArr[1], [submissionArr[0], err ? "" : file, dataPath]);
			// Log that there was an issue reading the data file associated to the library record requested.
			if(err) { log.error("There was an issue reading the library record data file associated to the " + tools.parseFolder(submissionArr[0]) + ". Error Type: " + err.name + ". Error Message: " + err.message + "."); }
		});
	});

	// Handles the process of obtaining a synopsis associated to a library record based on a folder name.
	ipc.on("getSynopsis", (event, submissionArr) => {
		// Read the data file associated to the library record.
		fs.readFile(path.join(originalPath, "Trak", "data", submissionArr[0], "data.json"), "UTF8", (err, file) => {
			// Send the record data to the front-end.
			event.sender.send("sentSynopsis", [err ? "" : file, submissionArr[1]]);
			// If there was an issue in reading the data file associated to the requested library record log it.
			if(err) {
				const curRecord = JSON.parse(submissionArr[1]);
				if(curRecord.category == "Anime" || curRecord.category == "Manga") {
                    log.error("There was an issue reading the data file associated to the " + curRecord.category.toLowerCase() + " "
                        + (curRecord.name != "" ? curRecord.name : curRecord.jname) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
                }
                else if(curRecord.category == "Book") {
                    log.error("There was an issue reading the data file associated to the book " +
                        (curRecord.name != "" ? curRecord.name : curRecord.isbn) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
                }
                else if(curRecord.category == "Film" || curRecord.category == "Show") {
                    log.error("There was an issue reading the data file associated to the " + curRecord.category.toLowerCase() + " " + curRecord.name + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
                }
			}
		});
	});

	// Handles the process of obtaining the list of library records which share an associated with a requested library record.
	ipc.on("getAssociations", (event, name) => {
		// Read the configurations associations file.
		fs.readFile(path.join(originalPath, "Trak", "data", "associations.json"), "UTF8", (err, file) => {
			// Log if there was an issue in reading the configurations associations file.
			if(err) { log.error("There was an issue reading the application associations configuration file. Error Type: " + err.name + ". Error Message: " + err.message + "."); }
			// Otherwise proceed by finding the desired associations.
			else {
				// Define the list of associations currently saved.
				const associationsFileList = JSON.parse(file).associations,
					associationsArr = [];
				// Iterate through the list of library associations.
		        for(let t = 0; t < associationsFileList.length; t++) {
		        	// Proceed only if the current associations include the desired library record.
		            if(associationsFileList[t].includes(name)) {
		            	// Iterate through the current association which contains the desired library record.
		                for(let y = 0; y < associationsFileList[t].length; y++) {
		                	// Proceed only if the current record selected in the association is not the one provided.
		                    if(associationsFileList[t][y] != name) {
		                    	// For each associated record read the data file and push it into the overall collection.
		                        associationsArr.push(new Promise((resolve, reject) => {
		                        	// Read the record data file.
		                        	fs.readFile(path.join(originalPath, "Trak", "data", associationsFileList[t][y], "data.json"), "UTF8", (readErr, fle) => {
		                        		// Log if there was an issue in reading the record data file.
		                        		if(readErr) {
		                        			log.error("There was an issue reading the data file associated to the " + tools.parseFolder(associationsFileList[t][y]) + ". Error Type: " + readErr.name + ". Error Message: " + readErr.message + ".");
		                        			resolve([associationsFileList[t][y], ""]);
		                        		}
		                        		// Otherwise push the data as expected into the overall collection.
		                        		else {
		                        			resolve([associationsFileList[t][y], fle]);
		                        		}
		                        	});
		                        }));
		                    }
		                }
		                break;
		            }
		        }
		        // Once all promises associated to the library records have been resolved send the final collection to the front-end.
		        Promise.all(associationsArr).then(results => {
		        	event.sender.send("sentAssociations", results);
		        });
			}
		});
	});

	// Handles the process of obtaining all library records.
	ipc.on("getAllRecords", event => {
		// Define the library directory.
		let pathDir = path.join(originalPath, "Trak", "data"),
			list = [],
			submissionList = [];
		// Define the collection of library records if it exists.
		if(fs.existsSync(pathDir)) { list = fs.readdirSync(pathDir).filter(file => fs.statSync(path.join(pathDir, file)).isDirectory() && file.split("-").length > 2); }
		// Iterate through the collection of library records.
		for(let r = 0; r < list.length; r++) {
			// Read the library record data file and push a promise of the record data into the overall collection.
			submissionList.push(new Promise((resolve, reject) => {
				// Read the record data file.
				fs.readFile(path.join(originalPath, "Trak", "data", list[r], "data.json"), "UTF8", (err, file) => {
					// Log if there was an issue in reading the library record data file.
					if(err) {
						log.error("There was an issue reading the data file associated to the " + tools.parseFolder(list[r]) + ". Error Type: " + err.name + ". Error Message: " + err.message + ".");
						resolve([list[r], ""]);
					}
					// Otherwise push the data as expected into the overall collection.
					else {
						resolve([list[r], file]);
					}
				});
			}));
		}
		// Once all promised associated to the library records have been resolved asend the final collection to the front-end.
		Promise.all(submissionList).then(results => {
			event.sender.send("sentAllRecords", [results, dataPath]);
		});
	});

	// Handles the process of obtaining a library record based upon an autocomplete search.
	ipc.on("getLibraryRecordAutocomplete", (event, txt) => {
		// Define the library directory.
		let pathDir = path.join(originalPath, "Trak", "data"),
			list = [];
			// Define the collection of library records if it exists.
		if(fs.existsSync(pathDir)) { list = fs.readdirSync(pathDir).filter(file => fs.statSync(path.join(pathDir, file)).isDirectory() && file.split("-").length > 2); }
		let n = 0;
		// Iterate through the collection of library records.
		for(; n < list.length; n++) {
			// Define the data associated to the current library record.
			let selectedData = JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "data", list[n], "data.json"), "UTF8"));
	        // Proceed if the current library record is the one corresponding to the autocomplete search selection.
	        if(txt == selectedData.name + " (" + selectedData.category + ")") {
	            event.sender.send("sentLibraryRecordAutocomplete", [list[n], JSON.stringify(selectedData)]);
	            break;
	        }
		}
		// If no library record was found to correspond to the autocomplete search send an empty response to the front-end.
		if(n == list.length) {
			event.sender.send("sentLibraryRecordAutocomplete", ["", ""]);
		}
	});

	// Handles the process of merging multiple records of the same category into a single one.
	ipc.on("mergeRequest", (event, sub) => {
		// Define the function which will handle the comparison of anime season premieres.
		const seasonCompare = (lhs, rhs) => {
			// Define the function which will translate a season into a numerical value.
			const seasonNumeric = str => {
				let val = 0;
				if(str == "Winter") { val = 3; }
				else if(str == "Spring") { val = 2; }
				else if(str == "Summer") { val = 1; }
				return val;
			}
			// Define the boolean which will measure whether the season premiere on the right hand side is earlier than the left hand side.
			let checkVal = false;
			// Convert the seasons into a numerical value.
			lhs[0] = seasonNumeric(lhs[0]);
			rhs[0] = seasonNumeric(rhs[0]);
			// Convert the years into integers.
			lhs[1] = parseInt(lhs[1]);
			rhs[1] = parseInt(rhs[1]);
			// Update the boolean accordingly if the right hand side corresponds to an earlier premier.
			if(rhs[1] - lhs[1] < 0) {
				checkVal = true;
			}
			else if(rhs[1] - lhs[1] == 0) {
				checkVal = rhs[0] - lhs[0] < 0;
			}
			// Return the boolean.
			return checkVal;
		};
		// Define the base record to which all other records will be merged into.
		const keeper = sub[0],
			removalList = sub[1];
		// Read the data file associated to the base record.
		fs.readFile(path.join(originalPath, "Trak", "data", keeper, "data.json"), "UTF8", (readErr, readContent) => {
			// If there was an error in reading the data file of the base record update the logs.
			if(readErr) {
				log.error("There was an issue reading the data file associated to the " + tools.parseFolder(keeper) + ". Error Type: " + readErr.name + ". Error Message: " + readErr.message + ".");
			}
			// If no error showed up in reading the data file of the base record proceed.
			else {
				// Define the data of the base record.
				const baseData = JSON.parse(readContent),
					mergePromises = [];
				// Define the string to be used in notifying the logs on which records have been merged.
				let logMessage = baseData.name;
				// Iterate through the list of all records to be merged.
				for(let w = 0; w < removalList.length; w++) {
					// Proceed only if the current record does not correspond to the base record.
					if(removalList[w] != keeper) {
						// Create a promise which corresponds to the execution of reading the current record and copying over its contents.
						mergePromises.push(new Promise((mergeRes, mergeRej) => {
							// Read the data file of the current record.
							fs.readFile(path.join(originalPath, "Trak", "data", removalList[w], "data.json"), "UTF8", (remErr, remContent) => {
								// If there was an error in reading the data file of the current record update the logs.
								if(remErr) {
									log.error("There was an issue reading the data file associated to the " + tools.parseFolder(removalList[w]) + ". Error Type: " + remErr.name + ". Error Message: " + remErr.message + ".");
								}
								// If no error showed up in reading the data file of the current record proceed.
								else {
									// Define the data of the current record.
									let remData = JSON.parse(remContent);
									// Update the base record synopsis.
									baseData.synopsis += "\n" + remData.synopsis;
									baseData.synopsis = baseData.synopsis.trim();
									// Update the base record review.
									baseData.review += "\n" + remData.review;
									baseData.review = baseData.review.trim();
									// Update the base record genres.
									for(let q = 0; q < remData.genres[1].length; q++) {
										if(remData.genres[1][q] == true) {
											baseData.genres[1][q] = true;
										}
									}
									let combo = baseData.genres[2].concat(remData.genres[2]);
									baseData.genres[2] = ([...new Set(combo)]);
									// Update the base record images.
									baseData.img = baseData.img.concat(tools.objCreationImgs(path, fs, require("https"), originalPath, keeper, [false, remData.img]));
									// Update the base record related content.
									baseData.content = baseData.content.concat(remData.content);
									// Update the base record writers.
									baseData.writers += baseData.writers != "" ? ", " + remData.writers : remData.writers;
									// For the remainder proceed only if dealing with anime records.
									if(baseData.category == "Anime") {
										// Update the base record directors.
										baseData.directors += baseData.directors != "" ? ", " + remData.directors : remData.directors;
										// Update the base record producers.
										baseData.producers += baseData.producers != "" ? ", " + remData.producers : remData.producers;
										// Update the base record music directors.
										baseData.musicians += baseData.musicians != "" ? ", " + remData.musicians : remData.musicians;
										// Update the base record studio.
										baseData.studio += baseData.studio != "" ? ", " + remData.studio : remData.studio;
										// Update the base record license.
										baseData.license += baseData.license != "" ? ", " + remData.license : remData.license;
										// Update the base record season and year.
										if(remData.season != "" && remData.year != "") {
											if(seasonCompare([baseData.season, baseData.year], [remData.season, remData.year])) {
												baseData.season = remData.season;
												baseData.year = remData.year;
											}
										}
									}
									else if(baseData.category == "Manga") {
										// Update the base record publisher.
										baseData.publisher += baseData.publisher != "" ? ", " + remData.publisher : remData.publisher;
										// Update the base record japanese publisher.
										baseData.jpublisher += baseData.jpublisher != "" ? ", " + remData.jpublisher : remData.jpublisher;
										// Update the base record illustrators.
										baseData.illustrators += baseData.illustrators != "" ? ", " + remData.illustrators : remData.illustrators;
										// Update the base record demographic.
										if(baseData.demographic == "") {
											baseData.demographic = remData.demographic;
										}
										// Update the base record start date.
										if(new Date(baseData.start).getTime() > new Date(remData.start).getTime()) {
											baseData.start = remData.start;
										}
										// Update the base record end date.
										if(new Date(baseData.start).getTime() < new Date(remData.start).getTime()) {
											baseData.end = remData.end;
										}
									}
									else if(baseData.category == "Show") {
										// Update the base record release.
										if(new Date(baseData.release).getTime() > new Date(remData.release).getTime()) {
											baseData.release = remData.release;
										}
										// Update the base record run time.
										if(parseInt(baseData.runTime) < parseInt(remData.runTime)) {
											baseData.runTime = remData.runTime;
										}
										// Update the base record directors.
										baseData.directors += baseData.directors != "" ? ", " + remData.directors : remData.directors;
										// Update the base record editors.
										baseData.editors += baseData.editors != "" ? ", " + remData.editors : remData.editors;
										// Update the base record cinematographers.
										baseData.cinematographers += baseData.cinematographers != "" ? ", " + remData.cinematographers : remData.cinematographers;
										// Update the base record producers.
										baseData.producers += baseData.producers != "" ? ", " + remData.producers : remData.producers;
										// Update the base record distributors.
										baseData.distributors += baseData.distributors != "" ? ", " + remData.distributors : remData.distributors;
										// Update the base record production companies.
										baseData.productionCompanies += baseData.productionCompanies != "" ? ", " + remData.productionCompanies : remData.productionCompanies;
										// Update the base record music directors.
										baseData.musicians += baseData.musicians != "" ? ", " + remData.musicians : remData.musicians;
										// Update the base record stars.
										baseData.stars += baseData.stars != "" ? ", " + remData.stars : remData.stars;
										// Update the base record studio.
										baseData.studio += baseData.studio != "" ? ", " + remData.studio : remData.studio;
										// Update the base record license.
										baseData.license += baseData.license != "" ? ", " + remData.license : remData.license;
										// Update the base record season and year.
										if(remData.season != "" && remData.year != "") {
											if(seasonCompare([baseData.season, baseData.year], [remData.season, remData.year])) {
												baseData.season = remData.season;
												baseData.year = remData.year;
											}
										}
									}
									// Copy all current record assets to the base record assets folder.
									fs.copy(path.join(originalPath, "Trak", "data", removalList[w], "assets"), path.join(originalPath, "Trak", "data", keeper, "assets"), assetsCpErr => {
										if(assetsCpErr) {
											log.error("There was an issue copying the assets associated to the " + tools.parseFolder(removalList[w]) + ". Error Type: " + assetsCpErr.name + ". Error Message: " + assetsCpErr.message + ".");
											mergeRej();
										}
										else {
											logMessage += ", " + remData.name;
											mergeRes();
										}
									})
								}
							});
						}));
					}
				}
				// Once all desired records have been absorbed into the base record write the new data file and remove all other records.
				Promise.all(mergePromises).then(() => {
					// Write the base record data file.
					fs.writeFile(path.join(originalPath, "Trak", "data", keeper, "data.json"), JSON.stringify(baseData), "UTF8", finalErr => {
						// If there was an error in writing the data file of the base record update the logs.
						if(finalErr) {
							log.error("There was an issue writing the data file associated to the " + tools.parseFolder(keeper) + ". Error Type: " + finalErr.name + ". Error Message: " + finalErr.message + ".");
						}
						// If no error showed up in writing the data file of the base record proceed.
						else {
							// Define the path to the associations file.
							const assocPath = path.join(originalPath, "Trak", "data", "associations.json");
							// Read the library associations file.
							fs.readFile(assocPath, "UTF8", (assocErr, assocFile) => {
								// If there was an error in reading the associations file update the logs.
								if(assocErr) {
									log.error("There was an issue in reading the associations file. Error Type: " + assocErr.name + ". Error Message: " + assocErr.message + ".");
								}
								// If no error showed up in reading the associations file proceed.
								else {
									// Define the new association tied to the base record and the list of all current library associations.
									const assocData = JSON.parse(assocFile),
										associationsList = assocData.associations,
										visited = [];
									let newAssoc = [];
									// Iterate through the list of records being merged.
									for(let h = 0; h < removalList.length; h++) {
										// Iterate through the list of all library associations.
										for(let g = 0; g < associationsList.length; g++) {
											// Proceed only if the current association contains the current merge record.
											if(associationsList[g].indexOf(removalList[h]) != -1) {
												// Keep track of the library associations which were visited.
												visited.push(g);
												// Concatenate the current library association to the new associations tied to the base record.
												newAssoc = newAssoc.concat(associationsList[g]);
												break;
											}
										}
									}
									// Add the base record to the new association.
									newAssoc.push(keeper);
									// Filter the new association of any duplicates.
									newAssoc = [...new Set(newAssoc)];
									// Remove all mentions of the merging records in the new association with the exception of the base record.
									for(let x = 0; x < removalList.length; x++) {
										if(removalList[x] != keeper) {
											let curIndex = newAssoc.indexOf(removalList[x]);
											if(curIndex != -1) {
												newAssoc.splice(curIndex, 1);
											}
										}
									}
									// Sort the collection of indices visited in the library associations collection from highest to lowest.
									visited.sort((a, b) => b - a);
									// Remove all visited associations.
									for(let r = 0; r < visited.length; r++) {
										associationsList.splice(visited[r], 1);
									}
									// Add the new association tied to the base record into the library associations.
									associationsList.push(newAssoc);
									assocData.associations = associationsList;
									// Write the new associations collection to the library associations file.
									fs.writeFile(assocPath, JSON.stringify(assocData), "UTF8", assocWriteErr => {
										// If there was an error in writing the associations file update the logs.
										if(assocErr) {
											log.error("There was an issue in writing the associations file. Error Type: " + assocWriteErr.name + ". Error Message: " + assocWriteErr.message + ".");
										}
										// If no error showed up in writing the associations file proceed.
										else {
											// Define the list of promises used to account for the removal of all non-base records.
											const delPromises = [];
											// Iterate through the list of records.
											for(let z = 0; z < removalList.length; z++) {
												// Proceed only if the current record is not the base record.
												if(removalList[z] != keeper) {
													// Create a promise which corresponds to the deletion of the current record folder.
													delPromises.push(new Promise((delRes, delRej) => {
														// Remove the folder associated to the current record and all contents.
														fs.remove(path.join(originalPath, "Trak", "data", removalList[z]), removalErr => {
															if(removalErr) {
																log.error("There was an issue deleting the folder associated to the " + tools.parseFolder(removalList[z]) + ". Error Type: " + removalErr.name + ". Error Message: " + removalErr.message + ".");
																delRej();
															}
															else { delRes(); }
														});
													}));
												}
											}
											// Once all non-base records have been deleted proceed to notify the user that the process has officially ended.
											Promise.all(delPromises).then(() => {
												log.info("The merge of the " + baseData.category.toLowerCase() + " records " + logMessage + " has finished.");
												mainWindow.reload();
												setTimeout(() => { mainWindow.webContents.send("mergeCompletion", [baseData.category.toLowerCase(), logMessage]); }, 500);
											});
										}
									});
								}
							});
						}
					});
				});
			}
		});
	});

	// Define the list of categories and the associated object containing the library import methods.
	const categoryArr = ["anime", "book", "film", "manga", "show"];
	const requireObj = {
		"tools": category => require("./" + category + "Tools"),
		"animeLib": () => malScraper,
		"bookLib": () => goodreadsScraper,
		"filmLib": () => movier,
		"mangaLib": () => malScraper,
		"showLib": () => movier
	};
	// Iterate through the list of categories.
	for(let w = 0; w < categoryArr.length; w++) {
		// Handles the search of a string through all possible records listings on a database.
		ipc.on(categoryArr[w] + "Search", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "Search"](log, requireObj[categoryArr[w] + "Lib"](), event, submission);
		});

		// Handles the fetching of details for a given record via its name.
		ipc.on(categoryArr[w] + "FetchDetails", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "FetchDetails" + (categoryArr[w] == "book" ? "ByName" : "")](log, requireObj[categoryArr[w] + "Lib"](), tools, event, submission, categoryArr[w] == "manga" ? requireObj["bookLib"]() : -1);
		});

		// Handles the fetching of record releases based on a query search.
		ipc.on(categoryArr[w] + "FetchSearch", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "FetchSearch"](log, requireObj[categoryArr[w] + "Lib"](), event, submission, path);
		});

		// Handles the fetching of a record synopsis.
		ipc.on(categoryArr[w] + "SynopsisFetch", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "SynopsisFetch"](log, requireObj[categoryArr[w] + "Lib"](), event, submission);
		});

		// Handles the opening of the addRecord.html page to load a record based on a content search.
		ipc.on(categoryArr[w] + "RecordRequest", (event, submission) => {
			// Have the secondary window load the corresponding html structure.
			let recordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, fs, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
			// Proceed once the window has finished loading.
	  		recordWindow.webContents.on("did-finish-load", () => {
	  			recordWindow.webContents.send("activeCategories", hiddenArr);
	  			// Fetch the record details from the corresponding online resource.
	  			recordWindow.webContents.send("searchRecordStart", categoryArr[w].charAt(0).toUpperCase() + categoryArr[w].substring(1));
	  			requireObj["tools"](categoryArr[w])[categoryArr[w] + "RecordRequest"](BrowserWindow, ipc, path, fs, log, require("https"), requireObj[categoryArr[w] + "Lib"](), tools, mainWindow, recordWindow, dataPath, submission, requireObj["bookLib"]());
	  		});
		});
	}
};



/*

Driver function for adding all anime listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- malScraper provides the means to obtain record details from myanimelist.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addAnimeListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, malScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of anime releases based on the season.
	ipc.on("animeFetchSeason", (event, submissionArr) => {
		require("./animeTools").animeFetchSeason(log, malScraper, event, submissionArr);
	});
};



/*

Driver function for adding all book listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- goodreadsScraper provides the means to obtain record details from goodreads.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addBookListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of details for a given book via its ISBN.
	ipc.on("bookFetchDetailsByISBN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByISBN(log, goodreadsScraper, event, submission);
	});

	// Handles the fetching of details for a given book via its ASIN.
	ipc.on("bookFetchDetailsByASIN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByName(log, goodreadsScraper, tools, event, submission, 0);
	});
};



/*

Driver function for adding all manga listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- goodreadsScraper provides the means to obtain record details from goodreads.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addMangaListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of details for a given manga volume via its ISBN.
	ipc.on("mangaVolumeFetchDetailsByISBN", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByISBN(log, goodreadsScraper, event, submission[0], submission[1]);
	});

	// Handles the fetching of details for a given manga volume via its name.
	ipc.on("mangaVolumeFetchDetailsByName", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByName(log, goodreadsScraper, event, submission[0], submission[1]);
	});
};



/*

Driver function for adding all database listeners.

	- shell and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- goodreadsScraper, malScraper, and movier provide the means to obtain record details from goodreads, myanimelist, or imdb, respectively.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- originalPath is the original path to the local user data.

*/
exports.addDatabaseListeners = (shell, path, fs, log, ipc, goodreadsScraper, malScraper, movier, tools, mainWindow, originalPath) => {
	// Handles the opening of the zip import sample directory.
  	ipc.on("importSampleZIP", event => {
  		shell.openPath(path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples"));
  		log.info("The directory containg the sample zip import has been opened.");
		event.sender.send("importSampleZIPSuccess");
  	});

  	// Handles the opening of the simple xlsx import sample directory.
  	ipc.on("importSampleSimpleXLSX", event => {
  		shell.openPath(path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Simple-XLSX-Export-Sample"));
  		log.info("The directory containg the sample simple xlsx import has been opened.");
		event.sender.send("importSampleSimpleXLSXSuccess");
  	});

  	// Handles the opening of the detailed xlsx import sample directory.
  	ipc.on("importSampleDetailedXLSX", event => {
  		shell.openPath(path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Detailed-XLSX-Export-Sample"));
  		log.info("The directory containg the sample detailed xlsx import has been opened.");
		event.sender.send("importSampleDetailedXLSXSuccess");
  	});

  	// Handles the export of the chosen library records into a single zip file, possibly compressed, or a xlsx file containing the details along with a zip, possibly compressed, for the assets.
	ipc.on("databaseExport", (event, submission) => {
		if(submission[2] == "XLSX") {
			tools.exportDataXLSX(fs, path, log, require("zip-local"), require("exceljs"), event, originalPath, submission[0], submission[1], submission[3], submission[4]);
		}
		else if(submission[2] == "ZIP") {
			tools.exportDataZIP(fs, path, log, require("zip-local"), event, originalPath, submission[0], submission[1], submission[4]);
		}
	});

	// Handles the import of chosen zip xlsx files containing records into the library. Duplicate records are checked for.
	ipc.on("databaseImport", (event, submission) => {
		if(submission[1] == "XLSX") {
			tools.importDriverXLSX(fs, path, log, ipc, malScraper, goodreadsScraper, movier, require("zip-local"), require("exceljs"), mainWindow, originalPath, event, submission[0], submission[2]);
		}
		else if(submission[1] == "ZIP") {
			tools.importDriverZIP(fs, path, log, ipc, malScraper, goodreadsScraper, movier, require("zip-local"), mainWindow, originalPath, event, submission[0]);
		}
	});
};



/*

Driver function for adding all settings listeners.

	- app and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- originalPath is the original path to the local user data.
	- mainWindow is an object referencing the primary window of the Electron app.

*/
exports.addSettingsListeners = (app, path, fs, log, ipc, originalPath, mainWindow) => {
	// Handles the saving of the tutorial.json file.
   	ipc.on("introductionFileSave", (event, launchIntro) => {
    	if(!fs.existsSync(path.join(originalPath, "Trak", "config", "tutorial.json"))) {
	    	fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) { 
	    			log.error("There was an issue in saving the tutorial configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
	    			event.sender.send("introductionFileSaveFailure");
	    		}
	    		else {
	    			log.info("The tutorial configuration file has been updated.");
	    		}
	    	});
    	}
    	else if(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction != launchIntro) {
    		fs.writeFile(path.join(originalPath, "Trak", "config", "tutorial.json"), JSON.stringify({ "introduction": launchIntro }), "UTF8", err => {
	    		if(err) {
	    			log.error("There was an issue in saving the tutorial configuration file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
	    			event.sender.send("introductionFileSaveFailure");
	    		}
	    		else {
	    			log.info("The tutorial configuration file has been updated.");
	    			event.sender.send("introductionFileSaveSuccess");
	    		}
	    	});
    	}
   	});

   	// Handles the saving of all options in the user settings.
	ipc.on("settingsSave", (event, submissionArr) => {
		require("./settings").updateSettings(fs, path, log, ipc, app, submissionArr, originalPath, mainWindow, event);
	});

	// Handle the opening of the github link on the about section.
  	ipc.on("aboutGithub", event => {
  		log.info("Opening the Github project page in the default browser.");
  		require("electron").shell.openExternal("https://github.com/nathanmarianovsky/Trak");
  	});
};



/*

Driver function for adding all update listeners.

	- app and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.

*/
exports.addUpdateListeners = (app, path, fs, log, ipc) => {
	// Add the listener for an update if the application is not build for a store listing.
	if(fs.existsSync(path.join(__dirname, "update.js"))) {
		require("./update").updateExec(app, path, fs, log, ipc);
	}

	// Handle the opening of the github release link on the update modal.
  	ipc.on("githubRelease", (event, url) => {
  		log.info("Opening the update release page in the default browser.");
  		require("electron").shell.openExternal(url);
  	});
};



/*

Driver function for adding all log listeners.

	- shell and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- tools provides a collection of local functions.
	- originalPath is the original path to the local user data.

*/
exports.addLogListeners = (shell, path, fs, log, ipc, tools, originalPath) => {
	if(process.platform == "linux") {
		originalPath = path.join(process.env.HOME, ".config");
	}
	else if(process.platform == "darwin") {
		originalPath = path.join(process.env.HOME, "Library");
	}
	// Handles the request for getting the logs since the last application load.
	ipc.on("logsRequest", event => {
		// Read the logs file.
        fs.readFile(path.join(originalPath, "Trak", "logs", "main.log"), "UTF8", (err, file) => {
        	if(err) {
        		log.error("There was an issue reading the logs file. Error Type: " + err.name + ". Error Message: " + err.message + ".");
        		event.sender.send("logsFileReadFailure");
        	}
            else {
            	log.info("The logs file was successfully read.");
            	// Split the file contents by lines.
	            let fileData = file.split("\n");
	            // Remove the last element which is an empty string.
	            fileData.pop();
	            // Iterate through the lines to determine the last application load.
	            let ind = fileData.length - 1;
	            for(; ind >= 0; ind--) {
	                if(fileData[ind].includes("The application is starting.")) { break; }
	            }
	            // Send the logs to the front-end.
	            event.sender.send("logsRequestResult", fileData.slice(ind));
            }
        });
	});

	// Handles the opening of the logs folder.
  	ipc.on("logsFolder", event => {
  		shell.openPath(path.join(originalPath, "Trak", "logs"));
  		log.info("The folder containing the log files has been opened.");
		event.sender.send("logsFolderSuccess");
  	});
};



/*

Driver function for adding all helper listeners.

	- ipc provides the means to operate the Electron app.
	- log provides the means to create application logs to keep track of what is going on.
	- mainWindow is an object referencing the primary window of the Electron app.

*/
exports.addHelperListeners = (log, ipc, mainWindow) => {
	// Handles the fetching of the primary window's current height in order to provide the necessary difference for the index page table height to be updated.
	ipc.on("getAppHeight", event => {
		event.sender.send("appHeight", mainWindow.getBounds().height - 800);
	});

  	// Checks the validity of a user given path.
  	ipc.on("checkPathValidity", (event, pathStr) => {
  		log.info("Checking the validity of the path " + pathStr + ".");
  		require('is-valid-path')(pathStr) == true ? event.sender.send("checkPathResult", true) : event.sender.send("checkPathResult", false);
  	});
};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- hiddenArr is an array containing booleans which indicate whether a category type is to be hidden in the application.
	- goodreadsScraper, malScraper, and movier provide the means to obtain record details from goodreads, myanimelist, or imdb, respectively.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- loadWindow is an object referencing the splash window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, shell, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, updateCondition, mainWindow, loadWindow,
	dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Add the configuration listeners.
	exports.addConfigurationListeners(path, fs, log, ipc, originalPath);
	// Add the titlebar listeners.
	exports.addTitlebarListeners(BrowserWindow, ipc);
	// Add the basic listeners.
	exports.addBasicListeners(app, shell, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, updateCondition, mainWindow, loadWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	// Add the listeners associated to all types of records.
	exports.addRecordListeners(shell, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to anime records.
	exports.addAnimeListeners(BrowserWindow, path, fs, log, dev, ipc, tools, malScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to book records.
	exports.addBookListeners(BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to manga records.
	exports.addMangaListeners(BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to exporting and importing data.
	exports.addDatabaseListeners(shell, path, fs, log, ipc, goodreadsScraper, malScraper, movier, tools, mainWindow, originalPath);
	// Add the listeners associated to all settings actions.
	exports.addSettingsListeners(app, path, fs, log, ipc, originalPath, mainWindow);
	// Add the listeners associated to all update actions.
	exports.addUpdateListeners(app, path, fs, log, ipc);
	// Add the listeners associated to log actions.
	exports.addLogListeners(shell, path, fs, log, ipc, tools, originalPath);
	// Add the listeners which act as tools for the front-end.
	exports.addHelperListeners(log, ipc, mainWindow);
};



module.exports = exports;