/*

BASIC DETAILS: After the app loads up with index.js this file is meant to handle all calls made to the back-end.

   - contactsListeners: Handles all listeners for the contacts portion of the app.
   - addListeners: Driver function for adding all app listeners.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Handles all listeners for the contacts portion of the app.

	- BrowserWindow and ipc provide the means to operate the Electron app.
	- path and fs provide the means to work with local files.
	- tools provides a collection of local functions meant to help with writing files and generating pdf files.
	- exec provides the means to open files and folders.
	- mainWindow is an object referencing the primary window of the Electron app.
	- infoPath is the path to the local user data.

*/
// exports.Listeners = (BrowserWindow, path, fs, exec, ipc, tools, mainWindow, infoPath) => {
//   	// Handles the load of the contacts add page.
//   	ipc.on("contactsAddLoad", event => {
//   		let contactsAddWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
//   		contactsAddWindow.webContents.on("did-finish-load", () => {
//   			ipc.once("addContactSubmission", (event, data) => {
//   				require("./modifyContact").addContact(data, event, contactsAddWindow, infoPath, fs, path);
//   				mainWindow.reload();
//   			});
//   		});
//   	});

//   	// Handles the load of a contact card.
//   	ipc.on("contactCard", (event, name) => {
//   		let contactCardWindow = tools.createWindow("contacts/contactCard", BrowserWindow, path, 800, 600);
//   		contactCardWindow.webContents.once("did-finish-load", () => {
//   			contactCardWindow.webContents.send("contactCardInfo", name);
//   		});
//   	});

//   	// Handles the load of a contact card's trip dates.
// 	ipc.on("contactTripDates", (event, info) => {
// 	    require("./contactTrips").fileCheckIterate(infoPath, info, BrowserWindow.getFocusedWindow(), fs, path);
// 	});

//   	// Handles the update of a contact.
//   	ipc.on("contactUpdate", (event, name) => {
//   		let contactUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
//   		contactUpdateWindow.webContents.on("did-finish-load", () => {
//   			contactUpdateWindow.webContents.send("contactUpdateInfo", name);
//   			ipc.once("updateContactSubmission", (event, data) => {
//   				require("./modifyContact").updateContact(data, event, contactUpdateWindow, infoPath, fs, path);
//   				mainWindow.reload();
//   			});
//   		});
//   	});

//   	// Handles the deletion of a contact.
//   	ipc.on("contactRemove", (event, name) => {
//   		require("./modifyContact").removeContact(name, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
//   	});

//   	// Handles the deletion of multiple contacts.
//   	ipc.on("contactsRemove", (event, list) => {
//   		require("./modifyContact").removeContacts(list, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
//   	});

//   	// Handles the opening of a contact's assets folder.
// 	ipc.on("contactFiles", (event, name) => {
// 		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "contacts", name, "assets"));
// 		event.sender.send("contactFilesSuccess", name.split("_")[1] + " " + name.split("_")[0]);
// 	});
// };



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
      		tools.createWindow("index", BrowserWindow, path);
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

  	// // Add listeners for all available apps.
  	// exports.recordListeners(BrowserWindow, path, fs, exec, ipc, tools, mainWindow, dataPath);

  	// Handles the load of the contacts add page.
  	ipc.on("contactsAddLoad", event => {
  		let contactsAddWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		contactsAddWindow.webContents.on("did-finish-load", () => {
  			ipc.once("addContactSubmission", (event, data) => {
  				require("./modifyContact").addContact(data, event, contactsAddWindow, infoPath, fs, path);
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
	    require("./contactTrips").fileCheckIterate(infoPath, info, BrowserWindow.getFocusedWindow(), fs, path);
	});

  	// Handles the update of a contact.
  	ipc.on("contactUpdate", (event, name) => {
  		let contactUpdateWindow = tools.createWindow("contacts/addContact", BrowserWindow, path, 1200, 900);
  		contactUpdateWindow.webContents.on("did-finish-load", () => {
  			contactUpdateWindow.webContents.send("contactUpdateInfo", name);
  			ipc.once("updateContactSubmission", (event, data) => {
  				require("./modifyContact").updateContact(data, event, contactUpdateWindow, infoPath, fs, path);
  				mainWindow.reload();
  			});
  		});
  	});

  	// Handles the deletion of a contact.
  	ipc.on("contactRemove", (event, name) => {
  		require("./modifyContact").removeContact(name, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
  	});

  	// Handles the deletion of multiple contacts.
  	ipc.on("contactsRemove", (event, list) => {
  		require("./modifyContact").removeContacts(list, event, mainWindow, BrowserWindow, ipc, infoPath, tools, fs, path);
  	});

  	// Handles the opening of a contact's assets folder.
	ipc.on("contactFiles", (event, name) => {
		exec(tools.startCommandLineFolder() + " " + path.join(infoPath, "BatHaTransportationApps", "data", "contacts", name, "assets"));
		event.sender.send("contactFilesSuccess", name.split("_")[1] + " " + name.split("_")[0]);
	});
};



module.exports = exports;