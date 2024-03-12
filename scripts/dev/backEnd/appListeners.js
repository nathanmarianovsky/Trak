/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

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

Driver function for adding all basic listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, and primaryWindowFullscreen are the window parameters.

*/
exports.addBasicListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
    		// Create a primary window.
	   		let win = tools.createWindow("index", originalPath, BrowserWindow, path, log, dev, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	   		// Proceed once the window has finished loading.
	   		win.webContents.on("did-finish-load", () => {
	   			// Send a request to the front-end to initialize the loading of library records on the primary window.
				win.webContents.send("loadRows", win.getContentSize()[1] - 800);
				// Send a request to the front-end to initialize the application tutorial.
  				tools.tutorialLoad(fs, path, log, win, originalPath);
  				// Check for an application update if necessary.
  				if(updateCondition == false) {
  					tools.checkForUpdate(require("os"), require("https"), fs, path, log, originalPath, win);
  					updateCondition = true;
  				}
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
			// Send a request to the front-end to initialize the application tutorial.
  			tools.tutorialLoad(fs, path, log, mainWindow, originalPath);
  		});
  	});

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
        					&& currentNotificationsFile.notifications[v].text == submissionContent[u][3]) { break; }
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
        				event.sender.send("notificationsReady");
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
        		const associationsFileList = JSON.parse(file).associations;
    			let focusItem = submissionArr[0] + "-" + tools.formatFolderName(submissionArr[1]),
        			w = 0;
        		// Iterate through the list of current associations.
        		for(; w < associationsFileList.length; w++) {
        			// If the current association contains any of the records in the submitted association then update the current association.
        			if(associationsFileList[w].includes(focusItem) || associationsFileList[w].some(r => submissionArr[2].includes(r))) {
        				associationsFileList[w] = [focusItem].concat(submissionArr[2]).sort((a, b) => a.split("-").slice(1).join("-").localeCompare(b.split("-").slice(1).join("-")));
        				break;
        			}
        		}
        		// Otherwise, if no association was found to contain any of the records in the submitted association create a new association.
        		if(w == associationsFileList.length) {
        			associationsFileList.push([focusItem].concat(submissionArr[2]).sort((a, b) => a.split("-").slice(1).join("-").localeCompare(b.split("-").slice(1).join("-"))))
        		}
        		// Write the new associations to the associations configuration file.
        		fs.writeFile(associationsPath, JSON.stringify({"associations": associationsFileList.filter(arrElem => arrElem.length > 1)}), "UTF8", er => {
        			// If an error occured in writing the associations configuration file then log it and notify the user.
        			if(er) {
        				log.error("There was an issue writing to the associations configuration file.");
        				event.sender.send("associationsFileWriteFailure");
        			}
        		});
        	}
  		});
  	});
};



/*

Driver function for adding all listeners associated to the maintenance of records.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addRecordListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the load of the addRecord.html page for the creation of a record.
  	ipc.on("addLoad", (event, scenario) => {
  		// Have the secondary window load the corresponding html structure.
  		let addWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
		// Proceed once the window has finished loading.
  		addWindow.webContents.on("did-finish-load", () => {
  			// Send a request to the front-end if the tutorial is chosen to be shown.
  			if(scenario == true) {
  				log.info("Loading the application tutorial for the addRecord.html page.");
  				addWindow.webContents.send("addIntroduction");
  			}
  			// Tell the front-end to display the default message for adding a new record.
  			addWindow.webContents.send("addRecordInitialMessage");
  			// Save the record upon a request from the front-end.
  			ipc.once("performSave", (event, submission) => {
  				require("./" + submission[0].toLowerCase() + "Tools")[submission[0].toLowerCase() + "Save"](BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
  			});
  		});
  	});

  	// Handles the load of the addRecord.html page for the update of a record.
  	ipc.on("updateRecord", (event, fldrName) => {
  		// Have the secondary window load the corresponding html structure.
  		let recordUpdateWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
		// Proceed once the window has finished loading.
  		recordUpdateWindow.webContents.on("did-finish-load", () => {
  			// Send a request to the front-end to load the record's details.
  			recordUpdateWindow.webContents.send("recordUpdateInfo", fldrName);
  			// Save the record upon a request from the front-end.
  			ipc.once("performSave", (event, submission) => {
  				require("./" + submission[0].toLowerCase() + "Tools")[submission[0].toLowerCase() + "Update"](BrowserWindow, path, fs, log, require("https"), tools, mainWindow, dataPath, event, submission);
  			});
  		});
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

	// Define the list of categories and the associated object containing the library import methods.
	const categoryArr = ["anime", "book", "film", "manga", "show"];
	const requireObj = {
		"tools": category => require("./" + category + "Tools"),
		"animeLib": val => require("mal-scraper"),
		"bookLib": val => require("goodreads-scraper"),
		"filmLib": val => val == true ? require("imdb-scrapper") : require("movier"),
		"mangaLib": val => require("mal-scraper"),
		"showLib": val => val == true ? require("imdb-scrapper") : require("movier")
	};
	// Iterate through the list of categories.
	for(let w = 0; w < categoryArr.length; w++) {
		// Handles the search of a string through all possible records listings on a database.
		ipc.on(categoryArr[w] + "Search", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "Search"](log, requireObj[categoryArr[w] + "Lib"](true), event, submission);
		});

		// Handles the fetching of details for a given record via its name.
		ipc.on(categoryArr[w] + "FetchDetails", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "FetchDetails" + (categoryArr[w] == "book" ? "ByName" : "")](log, requireObj[categoryArr[w] + "Lib"](false), tools, event, submission, categoryArr[w] == "manga" ? requireObj["bookLib"](false) : -1);
		});

		// Handles the fetching of record releases based on a query search.
		ipc.on(categoryArr[w] + "FetchSearch", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "FetchSearch"](log, requireObj[categoryArr[w] + "Lib"](false), event, submission, path);
		});

		// Handles the fetching of a record synopsis.
		ipc.on(categoryArr[w] + "SynopsisFetch", (event, submission) => {
			requireObj["tools"](categoryArr[w])[categoryArr[w] + "SynopsisFetch"](log, requireObj[categoryArr[w] + "Lib"](false), event, submission);
		});

		// Handles the opening of the addRecord.html page to load a record based on a content search.
		ipc.on(categoryArr[w] + "RecordRequest", (event, submission) => {
			// Have the secondary window load the corresponding html structure.
			let recordWindow = tools.createWindow("addRecord", originalPath, BrowserWindow, path, log, dev, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
			// Proceed once the window has finished loading.
	  		recordWindow.webContents.on("did-finish-load", () => {
	  			// Fetch the record details from the corresponding online resource.
	  			recordWindow.webContents.send("searchRecordStart", categoryArr[w].charAt(0).toUpperCase() + categoryArr[w].substring(1));
	  			requireObj["tools"](categoryArr[w])[categoryArr[w] + "RecordRequest"](BrowserWindow, ipc, path, fs, log, require("https"), requireObj[categoryArr[w] + "Lib"](false), tools, mainWindow, recordWindow, dataPath, submission, requireObj["bookLib"](false));
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
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addAnimeListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of anime releases based on the season.
	ipc.on("animeFetchSeason", (event, submissionArr) => {
		require("./animeTools").animeFetchSeason(log, require("mal-scraper"), event, submissionArr);
	});
};



/*

Driver function for adding all book listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addBookListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of details for a given book via its ISBN.
	ipc.on("bookFetchDetailsByISBN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByISBN(log, require("goodreads-scraper"), event, submission);
	});

	// Handles the fetching of details for a given book via its ASIN.
	ipc.on("bookFetchDetailsByASIN", (event, submission) => {
		require("./bookTools").bookFetchDetailsByName(log, require("goodreads-scraper"), tools, event, submission, 0);
	});
};



/*

Driver function for adding all manga listeners.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- log provides the means to create application logs to keep track of what is going on.
	- dev is a boolean representing whether the app is being run in a development mode.
	- tools provides a collection of local functions.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addMangaListeners = (BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Handles the fetching of details for a given manga volume via its ISBN.
	ipc.on("mangaVolumeFetchDetailsByISBN", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByISBN(log, require("goodreads-scraper"), event, submission[0], submission[1]);
	});

	// Handles the fetching of details for a given manga volume via its name.
	ipc.on("mangaVolumeFetchDetailsByName", (event, submission) => {
		require("./mangaTools").mangaVolumeFetchDetailsByName(log, require("goodreads-scraper"), event, submission[0], submission[1]);
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

*/
exports.addSettingsListeners = (app, path, fs, log, ipc, originalPath) => {
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
		require("./settings").updateSettings(fs, path, log, ipc, app, submissionArr, originalPath, event);
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

	// Handles the opening of the logs file.
  	ipc.on("logsFile", event => {
  		require("child_process").exec(tools.startCommandLineFolder() + " " + path.join(originalPath, "Trak", "logs"));
  		log.info("The folder containing the log files has been opened.");
		event.sender.send("logsFileSuccess");
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
	- updateCondition is a boolean used to ensure that a check for an update occurs only once per application load.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the current path to the local user data.
	- originalPath is the original path to the local user data.
	- primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, and secondaryWindowFullscreen are the window parameters.

*/
exports.addListeners = (app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, dataPath, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen) => {
	// Add the basic listeners.
	exports.addBasicListeners(app, BrowserWindow, path, fs, log, dev, ipc, tools, updateCondition, mainWindow, originalPath, primaryWindowWidth, primaryWindowHeight, primaryWindowFullscreen);
	// Add the listeners associated to all types of records.
	exports.addRecordListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to anime records.
	exports.addAnimeListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to book records.
	exports.addBookListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to manga records.
	exports.addMangaListeners(BrowserWindow, path, fs, log, dev, ipc, tools, mainWindow, dataPath, originalPath, secondaryWindowWidth, secondaryWindowHeight, secondaryWindowFullscreen);
	// Add the listeners associated to exporting and importing data.
	exports.addDatabaseListeners(path, fs, log, ipc, tools, mainWindow, originalPath);
	// Add the listeners associated to all settings actions.
	exports.addSettingsListeners(app, path, fs, log, ipc, originalPath);
	// Add the listeners associated to all update actions.
	exports.addUpdateListeners(app, path, fs, log, ipc);
	// Add the listeners associated to log actions.
	exports.addLogListeners(path, fs, log, ipc, tools, originalPath);
	// Add the listeners which act as tools for the front-end.
	exports.addHelperListeners(log, ipc, mainWindow);
};



module.exports = exports;