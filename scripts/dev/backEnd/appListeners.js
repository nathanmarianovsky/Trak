/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Driver function for adding all app listeners.

	- app, BrowserWindow, and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- dataPath is the path to the local user data.

*/
exports.addListeners = (app, BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath) => {
	// Loads the creation of a primary window upon the activation of the app.
  	app.on("activate", () => {
    	if(BrowserWindow.getAllWindows().length === 0) {
   		let win = tools.createWindow("index", BrowserWindow, path);
   		win.webContents.on("did-finish-load", () => {
	  			win.webContents.send("loadRows");
	  		});
    	}
  	});

  	// Close the Electron app if the primary window is closed.
  	mainWindow.on("close", () => {
    	mainWindow = null;
       	app.quit();
    });

  	// Handle the load of the home page.
  	ipc.on("home", event => {
  		mainWindow.loadFile(path.join(__dirname, "../../../pages", "dist", "index.html"));
  		mainWindow.webContents.on("did-finish-load", () => {
  			mainWindow.webContents.send("loadRows");
  		});
  	});

	// If the data folder does not exist, then create it.
	if(!fs.existsSync(path.join(dataPath, "Trak", "data"))) {
		fs.mkdirSync(path.join(dataPath, "Trak", "data"), { "recursive": true });
	}

  	// Handles the load of the contacts add page.
  	ipc.on("addLoad", event => {
  		let addWindow = tools.createWindow("addRecord", BrowserWindow, path, 1400, 1000);
  		addWindow.webContents.on("did-finish-load", () => {
  			ipc.once("addSubmission", (event, data) => {
  				// Check to see that the folder associated to the new record does not exist. 
				if(!fs.existsSync(path.join(dataPath, "Trek", "data", info[2] + "_" + info[0]))) {
					// Create a new directory for the assets associated to the new contact.
					fs.mkdirSync(path.join(dataPath, "Trek", "data", "contacts", info[2] + "_" + info[0], "assets"), { "recursive": true });
					// Write to the data file.
					let phoneArr = [];
					for(let j = 0; j < info[7].length; j++) {
						phoneArr.push({"label": info[6][j], "number": info[7][j]});
					}
					const contactData = {
						"firstName": info[0],
						"middleName": info[1],
						"lastName": info[2],
						"birthday": info[3],
						"notes": info[4],
						"phones": phoneArr
					};
					exports.writeDataFile(info, event, currentWindow, contactData, "A", dataPath, fs, path);
				}
				// If the folder exists, then notify the user of this.
				else {
					currentWindow.webContents.send("contactExists", info[0] + " " + info[2]);
				}
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the load of a contact card.
  	ipc.on("contactCard", (event, name) => {
  		let contactCardWindow = tools.createWindow("contacts/contactCard", BrowserWindow, path, 800, 600);
  		contactCardWindow.webContents.once("did-finish-load", () => {
  			contactCardWindow.webContents.send("contactCardInfo", name);
  		});
  	});

  	// Handles the load of a contact card's trip dates.
	ipc.on("contactTripDates", (event, info) => {
	    require("./contactTrips").fileCheckIterate(dataPath, info, BrowserWindow.getFocusedWindow(), fs, path);
	});

  	// Handles the update of a contact.
  	ipc.on("contactUpdate", (event, name) => {
  		let contactUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		contactUpdateWindow.webContents.on("did-finish-load", () => {
  			contactUpdateWindow.webContents.send("contactUpdateInfo", name);
  			ipc.once("updateContactSubmission", (event, data) => {
  				require("./modifyContact").updateContact(data, event, contactUpdateWindow, dataPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the deletion of a contact.
  	ipc.on("contactRemove", (event, name) => {
  		require("./modifyContact").removeContact(name, event, mainWindow, BrowserWindow, ipc, dataPath, tools, fs, path);
  	});

  	// Handles the deletion of multiple contacts.
  	ipc.on("contactsRemove", (event, list) => {
  		require("./modifyContact").removeContacts(list, event, mainWindow, BrowserWindow, ipc, dataPath, tools, fs, path);
  	});

  	// Handles the opening of a contact's assets folder.
	ipc.on("contactFiles", (event, name) => {
		exec(tools.startCommandLineFolder() + " " + path.join(dataPath, "BatHaTransportationApps", "data", "contacts", name, "assets"));
		event.sender.send("contactFilesSuccess", name.split("_")[1] + " " + name.split("_")[0]);
	});
};







/*

Handles the writing of files associated to a contact.

	- info is a contact name.
	- event provides the means to interact with the front-end of the Electron app.
	- win is an object representing the current window of the Electron app.
	- writeData is an object representing the data that is to be written to the data.json file.
	- mode is a string representing whether a contact is being added or updated.
	- savePath is the path to the local user data.
	- fs and path provide the means to work with local files.

*/
exports.writeDataFile = (info, event, win, writeData, mode, savePath, fs, path) => {
	const modeStr = (mode == "A" ? "add" : "update");
	fs.writeFile(path.join(savePath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0], "data.json"), JSON.stringify(writeData), "UTF8", err => {
		// If there was an error in writing to the data file, then notify the user.
		if(err) { event.sender.send(modeStr + "ContactFailure", info[0] + " " + info[2]); }
		else {
			// Copy over the files asked to be added as assets in association to a particular contact.
			let i = 0;
			for(; i < info[5].length; i++) {
				let dest = path.join(savePath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0], "assets", path.basename(info[5][i]));
				fs.copyFile(info[5][i], dest, err => {
					if(err) { event.sender.send("copyFailure", info[5][i]); }
				});
			}
			// Once all of the files have been updated, notify the user everything has been taken care of and close the window.
			if(i == info[5].length) {
				win.webContents.send(modeStr + "ContactSuccess", info[0] + " " + info[2]);
				setTimeout(() => { win.destroy(); }, 1500);
			}
		}
	});
};



// /*

// Handles the creation of a contact.

// 	- info is a contact name.
// 	- event provides the means to interact with the front-end of the Electron app.
// 	- currentWindow is an object representing the current window of the Electron app.
// 	- userPath is the path to the local user data.
// 	- fs and path provide the means to work with local files.

// */
// exports.addContact = (info, event, currentWindow, userPath, fs, path) => {
// 	// Check to see that the folder associated to the new contact does not exist. 
// 	if(!fs.existsSync(path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0]))) {
// 		// Create a new directory for the assets associated to the new contact.
// 		fs.mkdirSync(path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0], "assets"), { "recursive": true });
// 		// Write to the data file.
// 		let phoneArr = [];
// 		for(let j = 0; j < info[7].length; j++) {
// 			phoneArr.push({"label": info[6][j], "number": info[7][j]});
// 		}
// 		const contactData = {
// 			"firstName": info[0],
// 			"middleName": info[1],
// 			"lastName": info[2],
// 			"birthday": info[3],
// 			"notes": info[4],
// 			"phones": phoneArr
// 		};
// 		exports.writeDataFile(info, event, currentWindow, contactData, "A", userPath, fs, path);
// 	}
// 	// If the folder exists, then notify the user of this.
// 	else {
// 		currentWindow.webContents.send("contactExists", info[0] + " " + info[2]);
// 	}
// };



/*

Handles the update of a contact.

	- info is a contact name.
	- event provides the means to interact with the front-end of the Electron app.
	- currentWindow is an object representing the current window of the Electron app.
	- userPath is the path to the local user data.
	- fs and path provide the means to work with local files.

*/
exports.updateContact = (info, event, currentWindow, userPath, fs, path) => {
	// Define an object containing the updated contact data.
	let phoneArr = [];
	for(let j = 0; j < info[7].length; j++) {
		phoneArr.push({"label": info[6][j], "number": info[7][j]});
	}
	const contactData = {
		"firstName": info[0],
		"middleName": info[1],
		"lastName": info[2],
		"birthday": info[3],
		"notes": info[4],
		"phones": phoneArr
	};
	// If the name has been updated then change the associated contact folder name.
	if(info[2] + "_" + info[0] != info[8]) {
		fs.rename(path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[8]), path.join(userPath, "BatHaTransportationApps", "data", "contacts", info[2] + "_" + info[0]), err => {
			// If there was an error in renaming the contact folder notify the user.
			if(err) {
				event.sender.send("contactFolderRenameFailure", [info[8], info[2] + "_" + info[0]]);
			}
			// If no error occured in renaming the contact folder write the data file, and copy over the file assets.
			else {
				exports.writeDataFile(info, event, currentWindow, contactData, "U", userPath, fs, path);
			}
		});
	}
	else {
		// Write the data file, and copy over the file assets.
		exports.writeDataFile(info, event, currentWindow, contactData, "U", userPath, fs, path);
	}
};



/*

Handles the removal of a contact.

	- data is a contact name.
	- event provides the means to interact with the front-end of the Electron app.
	- win is an object representing the current window of the Electron app.
	- BrowserWindow provides the means to create new windows in the Electron app.
	- ipc provides the means to handle a reaction on the back-end of the Electron app.
	- userPath is the path to the local user data.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- fs and path provide the means to work with local files.

*/
exports.removeContact = (data, event, win, BrowserWindow, ipc, userPath, tools, fs, path) => {
	// Create a new window to ask the user to confirm the deletion of a contact.
	let removeContactWindow = tools.createWindow("confirmation", BrowserWindow, path, 525, 325);
	// Once the new window has been loaded, supply the contact name to the front-end.
	removeContactWindow.webContents.on("did-finish-load", () => {
		removeContactWindow.webContents.send("contactConfirmationText", data);
		// Once a confirmation has been provided by the user close the window and delete the contact folder. 
		ipc.once("confirmationRemoveContact", (event, data) => {
			removeContactWindow.destroy();
			fs.rm(path.join(userPath, "BatHaTransportationApps", "data", "contacts", data), { "force": true, "recursive": true }, err => {
				// If there was an error in deleting the contact folder notify the user.
				if(err) { win.webContents.send("contactRemovalFailure", data); }
				// If no error was thrown in the deletion of the contact folder refresh the primary window and notify the user.
				else {
					win.reload();
					setTimeout(() => { win.webContents.send("contactRemovalSuccess", data); }, 500);
				}
			});
		});
	});
};



/*

Handles the removal of multiple contacts.

	- data is a collection of contact names.
	- event provides the means to interact with the front-end of the Electron app.
	- win is an object representing the current window of the Electron app.
	- BrowserWindow provides the means to create new windows in the Electron app.
	- ipc provides the means to handle a reaction on the back-end of the Electron app.
	- userPath is the path to the local user data.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- fs and path provide the means to work with local files.

*/
exports.removeContacts = (data, event, win, BrowserWindow, ipc, userPath, tools, fs, path) => {
	// Create a new window to ask the user to confirm the deletion of a contact.
	let removeContactsWindow = tools.createWindow("confirmation", BrowserWindow, path, 525, 325);
	// Once the new window has been loaded, supply the message to the front-end.
	removeContactsWindow.webContents.on("did-finish-load", () => {
		removeContactsWindow.webContents.send("contactsConfirmationText", data);
		// Once a confirmation has been provided by the user close the window and delete the associated contact folders. 
		ipc.once("confirmationRemoveContacts", (event, data) => {
			removeContactsWindow.destroy();
			let j = 0;
			for(; j < data.length; j++) {
				fs.rm(path.join(userPath, "BatHaTransportationApps", "data", "contacts", data[j]), { "force": true, "recursive": true }, err => {
					// If there was an error in deleting the contact folder notify the user.
					if(err) { win.webContents.send("contactRemovalFailure", data[j]); }
				});
			}
			// Refresh the primary window and notify the user that all checked contacts have been removed.
			if(j == data.length) {
				win.reload();
				setTimeout(() => { win.webContents.send("contactsRemovalSuccess"); }, 500);
			}
		});
	});
};









module.exports = exports;