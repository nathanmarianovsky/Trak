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
const { app, BrowserWindow, Menu, MenuItem, Tray, shell } = require("electron"),
	ipc = require("electron").ipcMain,
	path = require("path"),
	fs = require("fs-extra"),
	contextMenu = require('electron-context-menu'),
	tools = require("./scripts/dist/backEnd/tools"),
	appListeners = require("./scripts/dist/backEnd/appListeners"),
	exec = require("child_process").exec,
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

	// Load the user's preferred window sizes if they exist.
	fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
		if(err) {  }
		else {
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
			fs.readFile(path.join(__dirname, "styles", "dist", "styles.css"), "UTF8", (err, stylesFile) => {
				if(err) {  }
				else {
					if(configObj.current != undefined) {
						const reg1 = new RegExp(configObj.current.previousPrimaryColor.toLowerCase(), "g"),
							reg2 = new RegExp(configObj.original.primaryColor.toLowerCase(), "g"),
							reg3 = new RegExp(configObj.current.previousSecondaryColor.toLowerCase(), "g"),
							reg4 = new RegExp(configObj.original.secondaryColor.toLowerCase(), "g");
						stylesFile = stylesFile.replace(reg1, configObj.current.primaryColor);
						stylesFile = stylesFile.replace(reg2, configObj.current.primaryColor);
						stylesFile = stylesFile.replace(reg3, configObj.current.secondaryColor);
						stylesFile = stylesFile.replace(reg4, configObj.current.secondaryColor);
						fs.writeFile(path.join(__dirname, "styles", "dist", "styles.css"), stylesFile, "UTF8", err => {
							if(err) {  }
							else {
								// Create the primary window.
							  	let primaryWindow = tools.createWindow("index", BrowserWindow, path, primWinWidth, primWinHeight, primWinFullscreen);
								primaryWindow.webContents.on("did-finish-load", () => {
									primaryWindow.webContents.send("loadRows", primWinHeight - 800);
								});
							  	// Create the system tray icon and menu. 
							  	tray = new Tray(path.join(__dirname, "/assets/logo.png"));
								tools.createTrayMenu("h", primaryWindow, tray, Menu);
								// Add all of the back-end listeners.
								appListeners.addListeners(app, BrowserWindow, path, fs, exec, shell, ipc, tools, primaryWindow, localPath, basePath, primWinWidth, primWinHeight, primWinFullscreen, secWinWidth, secWinHeight, secWinFullscreen);
							}
						});
					}
					else {
						// Create the primary window.
					  	let primaryWindow = tools.createWindow("index", BrowserWindow, path, primWinWidth, primWinHeight, primWinFullscreen);
						primaryWindow.webContents.on("did-finish-load", () => {
							primaryWindow.webContents.send("loadRows", primWinHeight - 800);
						});
					  	// Create the system tray icon and menu. 
					  	tray = new Tray(path.join(__dirname, "/assets/logo.png"));
						tools.createTrayMenu("h", primaryWindow, tray, Menu);
						// Add all of the back-end listeners.
						appListeners.addListeners(app, BrowserWindow, path, fs, exec, shell, ipc, tools, primaryWindow, localPath, basePath, primWinWidth, primWinHeight, primWinFullscreen, secWinWidth, secWinHeight, secWinFullscreen);
					}
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