/*

Declare all of the necessary variables.

	- app, BrowserWindow, Menu, MenuItem, Tray, and ipc provide the means to operate the Electron app.
	- fs and path provide the means to work with local files.
	- contextMenu provides the means to handle the menu associated to a right-click in the app.
	- tools provides a collection of local functions meant to help with writing files.
	- appListeners provides all of the back-end listeners.
	- exec provides the means to open files and folders.
	- localPath is the path to the local user data.

*/
const { app, BrowserWindow, Menu, MenuItem, Tray } = require("electron"),
	ipc = require("electron").ipcMain,
	path = require("path"),
	fs = require("fs"),
	contextMenu = require('electron-context-menu'),
	tools = require("./scripts/dist/backEnd/tools"),
	appListeners = require("./scripts/dist/backEnd/appListeners"),
	exec = require("child_process").exec,
	localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");



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

	// Create the primary window.
  	let primaryWindow = tools.createWindow("index", BrowserWindow, path);
	primaryWindow.webContents.on("did-finish-load", () => {
		primaryWindow.webContents.send("loadRows");
	});

  	// Create the system tray icon and menu. 
  	tray = new Tray(path.join(__dirname, "/assets/logo.png"));
	tools.createTrayMenu("h", primaryWindow, tray, Menu);

	// Add all of the back-end listeners.
	appListeners.addListeners(app, BrowserWindow, path, fs, exec, ipc, tools, primaryWindow, localPath);
});



// Ensures the Electron app closes properly.
app.on("window-all-closed", () => {
	if(process.platform !== "darwin") {
    	app.quit();
  	}
});