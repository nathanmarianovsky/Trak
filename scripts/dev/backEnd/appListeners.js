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
			if(err) { log.error("There was an issue reading the application settings configuration file."); }
		});
	});

	// Provides the application notifications data to the front-end.
	ipc.on("getNotifications", event => {
		fs.readFile(path.join(originalPath, "Trak", "config", "notifications.json"), "UTF8", (err, file) => {
			event.sender.send("sentNotifications", err ? "" : file);
			if(err) { log.error("There was an issue reading the application notifications file."); }
		});
	});

	// Provides the application tutorial configuration to the front-end.
	ipc.on("getTutorial", event => {
		if(fs.existsSync(path.join(originalPath, "Trak", "config", "tutorial.json"))) {
			fs.readFile(path.join(originalPath, "Trak", "config", "tutorial.json"), "UTF8", (err, file) => {
				event.sender.send("sentTutorial", err ? "" : file);
				if(err) { log.error("There was an issue reading the application settings tutorial file."); }
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
			if(err) { log.error("There was an issue reading the application package.json file."); }
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

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
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
exports.addBasicListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, updateCondition, mainWindow, loadWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen) => {
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
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(originalPath, "Trak", "data"));
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
        		log.error("There was an issue reading the notifications configuration file.");
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
        				log.error("There was an issue writing to the notifications configuration file.");
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
        		log.error("There was an issue reading the notifications configuration file.");
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
        				log.error("There was an issue writing to the notifications configuration file.");
        				event.sender.send("notificationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});

  	// Handle the update of the associations configuration file.
  	ipc.on("associationsSave", (event, submissionArr) => {
  		// Define the path to the associations configuration file.
  		const associationsPath = path.join(originalPath, "Trak", "config", "associations.json");
		// Read the associations configuration file.
  		fs.readFile(associationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the associations configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the associations configuration file.");
        		event.sender.send("associationsFileReadFailure");
        	}
        	// Otherwise, if no error was thrown proceed as designed.
        	else {
        		// Define the list of current associations and the id of the primary record submitted.
        		const associationsFileList = JSON.parse(file).associations,
        			focusName = submissionArr[0] + "-" + tools.formatFolderName(submissionArr[1]);
    			let focusItem = submissionArr[3] != "" ? submissionArr[3] : focusName
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
        				log.error("There was an issue writing to the associations configuration file.");
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

	- BrowserWindow and ipc provide the means to operate the Electron app.
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
exports.addRecordListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
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
  		const associationsPath = path.join(originalPath, "Trak", "config", "associations.json"),
  			notificationsPath = path.join(originalPath, "Trak", "config", "notifications.json");
  		// Read the associations configuration file.
  		fs.readFile(associationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the associations configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the associations configuration file.");
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
        				log.error("There was an issue writing to the associations configuration file.");
        				event.sender.send("associationsFileWriteFailure");
        			}
        		});
        	}
  		});
  		// Read the notifications configuration file.
  		fs.readFile(notificationsPath, "UTF8", (err, file) => {
  			// If an error occured in reading the notifications configuration file then log it and notify the user.
  			if(err) {
        		log.error("There was an issue reading the notifications configuration file.");
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
        				log.error("There was an issue writing to the notifications configuration file.");
        				event.sender.send("notificationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});

  	// Handles the opening of a record's assets folder.
	ipc.on("recordFiles", (event, params) => {
		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "Trak", "data", params[0], "assets"));
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
			if(err) { log.error("There was an issue reading the library record data file associated to the " + tools.parseFolder(submissionArr[0]) + "."); }
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
                        + (curRecord.name != "" ? curRecord.name : curRecord.jname) + ".");
                }
                else if(curRecord.category == "Book") {
                    log.error("There was an issue reading the data file associated to the book " +
                        (curRecord.name != "" ? curRecord.name : curRecord.isbn) + ".");
                }
                else if(curRecord.category == "Film" || curRecord.category == "Show") {
                    log.error("There was an issue reading the data file associated to the " + curRecord.category.toLowerCase() + " " + curRecord.name + ".");
                }
			}
		});
	});

	// Handles the process of obtaining the list of library records which share an associated with a requested library record.
	ipc.on("getAssociations", (event, name) => {
		// Read the configurations associations file.
		fs.readFile(path.join(originalPath, "Trak", "config", "associations.json"), "UTF8", (err, file) => {
			// Log if there was an issue in reading the configurations associations file.
			if(err) { log.error("There was an issue reading the application associations configuration file."); }
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
		                        	fs.readFile(path.join(originalPath, "Trak", "data", associationsFileList[t][y], "data.json"), "UTF8", (err, fle) => {
		                        		// Log if there was an issue in reading the record data file.
		                        		if(err) {
		                        			log.error("There was an issue reading the data file associated to the " + tools.parseFolder(associationsFileList[t][y]) + ".");
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
						log.error("There was an issue reading the data file associated to the " + tools.parseFolder(list[r]) + ".");
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

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- originalPath is the original path to the local user data.

*/
exports.addDatabaseListeners = (path, fs, log, ipc, tools, mainWindow, originalPath) => {
	// Handles the opening of the zip import sample directory.
  	ipc.on("importSampleZIP", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples"));
  		log.info("The directory containg the sample zip import has been opened.");
		event.sender.send("importSampleZIPSuccess");
  	});

  	// Handles the opening of the simple xlsx import sample directory.
  	ipc.on("importSampleSimpleXLSX", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Simple-XLSX-Export-Sample"));
  		log.info("The directory containg the sample simple xlsx import has been opened.");
		event.sender.send("importSampleSimpleXLSXSuccess");
  	});

  	// Handles the opening of the detailed xlsx import sample directory.
  	ipc.on("importSampleDetailedXLSX", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(JSON.parse(fs.readFileSync(path.join(originalPath, "Trak", "config", "location.json"), "UTF8")).appLocation, "assets", "importSamples", "Trak-Detailed-XLSX-Export-Sample"));
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
			tools.importDriverXLSX(fs, path, log, ipc, require("zip-local"), require("exceljs"), mainWindow, originalPath, event, submission[0], submission[2]);
		}
		else if(submission[1] == "ZIP") {
			tools.importDriverZIP(fs, path, log, ipc, require("zip-local"), mainWindow, originalPath, event, submission[0]);
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
	    			log.error("There was an error in saving the tutorial configuration file.");
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
	    			log.error("There was an error in saving the tutorial configuration file.");
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
	// Handles the download of an updated installer and launching it.
	ipc.once("appUpdate", (event, appUpdateData) => {
		// Define the path where the updated installer will download.
		const outputdir = path.join(require("os").homedir(), "TrakDownloads");
		// Create the TrakDownloads folder if it does not exist. If it does exist then empty it on load.
		if(!fs.existsSync(outputdir)) {
			log.info("Creating the TrakDownloads folder. To be located at " + outputdir);
			fs.mkdirSync(outputdir);
		}
		else {
			log.info("Emptying the TrakDownloads folder");
			fs.emptyDirSync(outputdir);
		}
		// Fetch the required asset from github.
		require("download-github-release")("nathanmarianovsky", "Trak", outputdir, release => release.prerelease === false, asset => asset.name == appUpdateData[1], false).then(() => {
		    // Notify the user that the app will close to proceed with the update.
		    const linkArr = appUpdateData[0].split("/");
		    log.info("The newest release of the application has finished downloading corresponding to version " + linkArr[linkArr.length - 2].split("v")[1] + ".");
		    event.sender.send("updateDownloadComplete");
		    // After a five second delay launch the updated installer and close the app.
		    setTimeout(() => {
				let child = require("child_process").spawn("cmd", ["/S /C " + appUpdateData[1]], {
					"detached": true,
					"cwd": outputdir,
					"env": process.env
				});
				log.info("The application is launching the updated release installer.");
				app.quit();
		    }, 5000);
		}).catch(err => log.error("There was an issue in downloading the latest Github release of the application."));
	});

	// Handle the opening of the github release link on the update modal.
  	ipc.on("githubRelease", (event, url) => {
  		log.info("Opening the update release page in the default browser.");
  		require("electron").shell.openExternal(url);
  	});
};



/*

Driver function for adding all log listeners.

	- ipc provides the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- tools provides a collection of local functions.
	- originalPath is the original path to the local user data.

*/
exports.addLogListeners = (path, fs, log, ipc, tools, originalPath) => {
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
        		log.error("There was an issue reading the logs file.");
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
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(originalPath, "Trak", "logs"));
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
exports.addListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, updateCondition, mainWindow, loadWindow,
	dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Add the configuration listeners.
	exports.addConfigurationListeners(path, fs, log, ipc, originalPath);
	// Add the titlebar listeners.
	exports.addTitlebarListeners(BrowserWindow, ipc);
	// Add the basic listeners.
	exports.addBasicListeners(app, BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, updateCondition, mainWindow, loadWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	// Add the listeners associated to all types of records.
	exports.addRecordListeners(BrowserWindow, path, fs, log, dev, ipc, tools, hiddenArr, goodreadsScraper, malScraper, movier, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to anime records.
	exports.addAnimeListeners(BrowserWindow, path, fs, log, dev, ipc, tools, malScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to book records.
	exports.addBookListeners(BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to manga records.
	exports.addMangaListeners(BrowserWindow, path, fs, log, dev, ipc, tools, goodreadsScraper, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to exporting and importing data.
	exports.addDatabaseListeners(path, fs, log, ipc, tools, mainWindow, originalPath);
	// Add the listeners associated to all settings actions.
	exports.addSettingsListeners(app, path, fs, log, ipc, originalPath, mainWindow);
	// Add the listeners associated to all update actions.
	exports.addUpdateListeners(app, path, fs, log, ipc);
	// Add the listeners associated to log actions.
	exports.addLogListeners(path, fs, log, ipc, tools, originalPath);
	// Add the listeners which act as tools for the front-end.
	exports.addHelperListeners(log, ipc, mainWindow);
};



module.exports = exports;