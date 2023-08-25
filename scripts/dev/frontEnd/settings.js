/*

BASIC DETAILS: This file handles all settings activity.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



// Display a notification if there was an issue in reading the configuration.json file.
ipcRenderer.once("configurationFileOpeningFailure", event => {
    M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing the configuration.json file.
ipcRenderer.once("configurationFileWritingFailure", event => {
    M.toast({"html": "There was an error writing the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file.
ipcRenderer.once("configurationFileWritingSuccess", event => {
    M.toast({"html": "The application settings have been updated. The application will now restart.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file.
ipcRenderer.once("configurationFileWritingSuccessSimple", event => {
    M.toast({"html": "The application settings have been updated.", "classes": "rounded"});
});



// Display a notification if there was an issue in copying the data associated to all records.
ipcRenderer.once("copyDataFailure", event => {
    M.toast({"html": "There was an issue in copying the data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in deleting the original data associated to all records.
ipcRenderer.once("dataDeleteFailure", event => {
    M.toast({"html": "There was an error in deleting the original data associated to the records.", "classes": "rounded"});
});



// Display the modal to be used in asking the user whether the original data folder should be deleted.
ipcRenderer.once("dataOriginalDeleteAsk", (event, response) => {
	const dataDeleteModalInstance = M.Modal.init(document.getElementById("dataDeleteModal"));
	dataDeleteModalInstance.open();
    document.getElementById("dataDeleteDeny").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [false, response]);
    });
    document.getElementById("dataDeleteAccept").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [true, response]);
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all settings choices.
    const settingsOptions = document.getElementById("settingsOptions"),
    	settingsAbout = document.getElementById("settingsAbout"),
    	settingsApply = document.getElementById("settingsApply");
    // Define the relevant portions of the page that are in the settings rotation.
    const settingsOptionsContainer = document.getElementById("settingsOptionsContainer");
    // Listen for a click event on the settingsWindows button on the top bar to display the windows settings.
    settingsOptions.addEventListener("click", e => {
        e.preventDefault();
        settingsOptionsContainer.style.display = "initial";
        settingsOptions.parentNode.classList.add("active");
    });
    // Read the settings configuration file.
    fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), (err, file) => {
    	// Define the inputs on the settings modal.
    	const primaryColor = document.getElementById("primaryColor"),
    		secondaryColor = document.getElementById("secondaryColor"),
    		appPath = document.getElementById("appPath"),
    		primaryWindowWidth = document.getElementById("primaryWindowWidth"),
    		primaryWindowHeight = document.getElementById("primaryWindowHeight"),
    		secondaryWindowWidth = document.getElementById("secondaryWindowWidth"),
    		secondaryWindowHeight = document.getElementById("secondaryWindowHeight");
        // Display a notification if there was an error in reading the configuration file.
        if(err) {
            M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
            // Load the original settings.
            primaryColor.value = "#2A2A8E";
            primaryColor.setAttribute("lastValue", "#2A2A8E");
    		secondaryColor.value = "#D9D9DB";
    		secondaryColor.setAttribute("lastValue", "#D9D9DB");
    		appPath.value = localPath;
    		appPath.setAttribute("lastValue", localPath);
    		primaryWindowWidth.value = "1000";
    		primaryWindowWidth.setAttribute("lastValue", "1000");
    		primaryWindowHeight.value = "800";
    		primaryWindowHeight.setAttribute("lastValue", "800");
    		secondaryWindowWidth.value = "1400";
    		secondaryWindowWidth.setAttribute("lastValue", "1400");
    		secondaryWindowHeight.value = "1000";
    		secondaryWindowHeight.setAttribute("lastValue", "1000");
        }
        // If the file loaded without issues populate the settings modal with the current application setup.
        else {
        	const configData = JSON.parse(file);
        	if(configData.current != undefined) {
        		primaryColor.value = configData.current.primaryColor;
        		primaryColor.setAttribute("lastValue", configData.current.primaryColor);
        		secondaryColor.value = configData.current.secondaryColor;
        		secondaryColor.setAttribute("lastValue", configData.current.secondaryColor);
        		appPath.value = configData.current.path;
        		appPath.setAttribute("lastValue", configData.current.path);
        		primaryWindowWidth.value = configData.current.primaryWindowWidth;
        		primaryWindowWidth.setAttribute("lastValue", configData.current.primaryWindowWidth);
        		primaryWindowHeight.value = configData.current.primaryWindowHeight;
        		primaryWindowHeight.setAttribute("lastValue", configData.current.primaryWindowHeight);
        		secondaryWindowWidth.value = configData.current.secondaryWindowWidth;
        		secondaryWindowWidth.setAttribute("lastValue", configData.current.secondaryWindowWidth);
        		secondaryWindowHeight.value = configData.current.secondaryWindowHeight;
        		secondaryWindowHeight.setAttribute("lastValue", configData.current.secondaryWindowHeight);
        	}
        	else {
        		primaryColor.value = configData.original.primaryColor;
        		primaryColor.setAttribute("lastValue", configData.original.primaryColor);
        		secondaryColor.value = configData.original.secondaryColor;
        		secondaryColor.setAttribute("lastValue", configData.original.secondaryColor);
        		appPath.value = configData.original.path;
        		appPath.setAttribute("lastValue", configData.original.path);
        		primaryWindowWidth.value = configData.original.primaryWindowWidth;
        		primaryWindowWidth.setAttribute("lastValue", configData.original.primaryWindowWidth);
        		primaryWindowHeight.value = configData.original.primaryWindowHeight;
        		primaryWindowHeight.setAttribute("lastValue", configData.original.primaryWindowHeight);
        		secondaryWindowWidth.value = configData.original.secondaryWindowWidth;
        		secondaryWindowWidth.setAttribute("lastValue", configData.original.secondaryWindowWidth);
        		secondaryWindowHeight.value = configData.original.secondaryWindowHeight;
        		secondaryWindowHeight.setAttribute("lastValue", configData.original.secondaryWindowHeight);
        	}
            document.getElementById("settingsColorReset").addEventListener("click", e => {
                primaryColor.value = configData.original.primaryColor;
                secondaryColor.value = configData.original.secondaryColor;
            });
            document.getElementById("settingsDataReset").addEventListener("click", e => {
                appPath.value = configData.original.path;
                appPath.classList.remove("validate", "valid");
            });
            document.getElementById("settingsSizesReset").addEventListener("click", e => {
                primaryWindowWidth.value = configData.original.primaryWindowWidth;
                primaryWindowWidth.classList.remove("validate", "valid");
                primaryWindowHeight.value = configData.original.primaryWindowHeight;
                primaryWindowHeight.classList.remove("validate", "valid");
                secondaryWindowWidth.value = configData.original.secondaryWindowWidth;
                secondaryWindowWidth.classList.remove("validate", "valid");
                secondaryWindowHeight.value = configData.original.secondaryWindowHeight;
                secondaryWindowHeight.classList.remove("validate", "valid");
            });
        }
    	settingsOptions.click();
    	// Reset the values in the settings modal upon an exit.
    	const settingsModalInstance = M.Modal.init(document.getElementById("settingsModal"), { "onCloseStart": () => {
    			primaryColor.value = primaryColor.getAttribute("lastValue");
	    		secondaryColor.value = secondaryColor.getAttribute("lastValue");
	    		appPath.value = appPath.getAttribute("lastValue");
	    		appPath.classList.remove("validate", "valid");
	    		primaryWindowWidth.value = primaryWindowWidth.getAttribute("lastValue");
	    		primaryWindowWidth.classList.remove("validate", "valid");
	    		primaryWindowHeight.value = primaryWindowHeight.getAttribute("lastValue");
	    		primaryWindowHeight.classList.remove("validate", "valid");
	    		secondaryWindowWidth.value = secondaryWindowWidth.getAttribute("lastValue");
	    		secondaryWindowWidth.classList.remove("validate", "valid");
	    		secondaryWindowHeight.value = secondaryWindowHeight.getAttribute("lastValue");
	    		secondaryWindowHeight.classList.remove("validate", "valid");
    		}
    	});
    	settingsApply.addEventListener("click", e => {
    		const submitPath = appPath.value.substring(appPath.value.length - 10) == "\\Trak\\data" ? appPath.value : appPath.value + "\\Trak\\data";
    		console.log(submitPath);
    		ipcRenderer.send("settingsSave", [
    			submitPath,
				primaryColor.value,
				secondaryColor.value,
				primaryWindowWidth.value,
				primaryWindowHeight.value,
				secondaryWindowWidth.value,
				secondaryWindowHeight.value
    		]);
    		settingsModalInstance.close();
    	});
    	appPath.addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	primaryWindowWidth.addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	primaryWindowHeight.addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	secondaryWindowWidth.addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	secondaryWindowHeight.addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    });
});