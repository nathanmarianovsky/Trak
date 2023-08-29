/*

BASIC DETAILS: This file serves as the collection of tools utilized by the various back-end requests.

   - createTrayMenu: Create the system tray icon and menu.
   - createWindow: Executes the creation of the primary window with all necessary parameters.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



var exports = {};



/*

Create the system tray icon and menu.

	- mode is either "h" or "s" depending on whether the system icon menu should have the option to hide or show the app.
	- win is an object that represents the primary window of the Electron app.
	- trayObj and Menu are objects provided by the Electron app to handle the loading of the app tray and menu.

*/ 
exports.createTrayMenu = (mode, win, trayObj, Menu) => {
	const label = (mode == "h" ? "Hide" : "Show");
	trayObj.setToolTip("Bat-Ha Transportation Apps");
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
	- width and height are the physical parameters for describing the created window size.

*/
exports.createWindow = (extension, BrowserWindow, path, width = 1000, height = 800, fullscreen = false, resizable = true) => {
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
	win.loadFile(path.join(__dirname, "../../../pages", "dist", extension + ".html"));
	if(fullscreen == true) { win.maximize(); }
  	return win;
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