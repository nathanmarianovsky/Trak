/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - exportData: Create a zip file containing the exported library records.
   - createTrayMenu: Create the system tray icon and menu.
   - createWindow: Executes the creation of the primary window with all necessary parameters.
   - tutorialLoad: Tells the front-end to load the application tutorial.
   - startCommandLineFolder: Provides the necessary command to execute the opening of a folder.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Create a zip file containing the exported library records.

	- fs and path provide the means to work with local files.
	- zipper is a library object which can create zip files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- exportLocation is a string representing the location where the generated zip file will be placed.

*/ 
exports.exportData = (fs, path, zipper, eve, dir, exportLocation) => {
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
		if(err) { eve.sender.send("configurationFileOpeningFailure");  }
		else {
			const fileData = JSON.parse(fileContent);
			zipper.zip(fileData.current != undefined ? fileData.current.path : fileData.original.path, (prob, zipped) => {
				if(prob) { eve.sender.send("exportZippingFailure"); }
				else {
					zipped.save(path.join(exportLocation, "Trak-Export-" + (new Date().toJSON().slice(0, 10).replace(/-/g, ".")) + ".zip"), zipErr => {
						if(zipErr) { eve.sender.send("exportZipFileFailure"); }
						else { eve.sender.send("exportZipFileSuccess", exportLocation); }
					});
				}
			});
		}
	});
};



/*

Reads zip files and adds their content to the library records.

	- fs and path provide the means to work with local files.
	- zipper is a library object which can create zip files.
	- eve is the object which allows for interaction with the fron-end of the Electron application.
	- dir is a string representing the base directory corresponding to the location of the configuration file.
	- zipList is an array of zip files to be imported.

*/ 
exports.importData = (fs, path, zipper, eve, dir, zipList) => {
	fs.readFile(path.join(dir, "Trak", "config", "configuration.json"), "UTF8", (err, fileContent) => {
		if(err) { eve.sender.send("configurationFileOpeningFailure");  }
		else {
			const fileData = JSON.parse(fileContent).current != undefined ? JSON.parse(fileContent).current.path : JSON.parse(fileContent).original.path;
			zipList.forEach(zipPath => {
				zipper.unzip(zipPath, (er, unzipped) => {
					if(er) { eve.sender.send("importUnzippingFailure", zipPath); }
					else {
						unzipped.save(fileData, issue => {
							if(issue) { eve.sender.send("importZipFileFailure", zipPath); }
							else { eve.sender.send("importZipFileSuccess"); }
						});
					}
				});
			});
		}
	});
};



/*

Create the system tray icon and menu.

	- mode is either "h" or "s" depending on whether the system icon menu should have the option to hide or show the app.
	- win is an object that represents the primary window of the Electron app.
	- trayObj and Menu are objects provided by the Electron app to handle the loading of the app tray and menu.

*/ 
exports.createTrayMenu = (mode, win, trayObj, Menu) => {
	const label = (mode == "h" ? "Hide" : "Show");
	trayObj.setToolTip("Trak");
	trayObj.setContextMenu(Menu.buildFromTemplate([
		{ "label": label, click: () => {
			if(mode == "h") {
				win.hide();
				exports.createTrayMenu("s", win, trayObj, Menu);
			}
			else {
				win.show();
				exports.createTrayMenu("h", win, trayObj, Menu);
			}
		}},
		{ "label": "Quit", "role": "quit" }
	]));
};


/*

Executes the creation of the primary window with all necessary parameters.

	- extension refers to the html file name.
	- dir is the directory containing the display pages.
	- BrowserWindow provides the means to create a new app window.
	- width and height are the physical parameters for describing the created window size.
	- fullscreen is a boolean representing whether the window should be maximized on launch.
	- resizable is a boolean representing whether a window should be allowed to rescale.

*/
exports.createWindow = (extension, dir, BrowserWindow, path, width = 1000, height = 800, fullscreen = false, resizable = true) => {
  	let win = new BrowserWindow({
		"width": width,
    	"height": height,
    	"autoHideMenuBar": true,
    	"center": true,
    	"resizable": resizable,
    	"webPreferences": {
    		"nodeIntegration": true,
    		"contextIsolation": false
    	},
    	"icon": __dirname + "/assets/favicon.ico"
	});
	win.loadFile(path.join(dir, "Trak", "localPages", extension + ".html"));
	if(fullscreen == true) { win.maximize(); }
  	return win;
};



/*

Tells the front-end to load the application tutorial.

	- fs and path provide the means to work with local files.
	- win is the primary window of the app.
	- sysPath is the system location for the application configuration.

*/
exports.tutorialLoad = (fs, path, win, sysPath) => {
	if(!fs.existsSync(path.join(sysPath, "Trak", "config", "tutorial.json"))) {
		win.webContents.send("introduction", false);
	}
	else {
		const intro = JSON.parse(fs.readFileSync(path.join(sysPath, "Trak", "config", "tutorial.json"), "UTF8")).introduction;
		if(intro == true) {
			win.webContents.send("introduction", true);
		}
	}
};



/*

Provides the necessary command to execute the opening of a folder.

*/
exports.startCommandLineFolder = () => {
   switch(process.platform) { 
      case "darwin" : return "open";
      case "win32" : return "explorer";
      case "win64" : return "explorer";
      default : return "xdg-open";
   }
};



module.exports = exports;