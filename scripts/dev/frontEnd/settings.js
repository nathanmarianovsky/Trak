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
ipcRenderer.on("configurationFileOpeningFailure", event => {
    M.toast({"html": "There was an error opening the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing the configuration.json file.
ipcRenderer.on("configurationFileWritingFailure", event => {
    M.toast({"html": "There was an error writing the configuration file associated to the application settings.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file and the requirement of an application restart.
ipcRenderer.on("configurationFileWritingSuccess", event => {
    M.toast({"html": "The application settings have been updated. The application will now restart.", "classes": "rounded"});
});



// Display a notification for the successful update of the configuration.json file.
ipcRenderer.on("configurationFileWritingSuccessSimple", event => {
    M.toast({"html": "The application settings have been updated.", "classes": "rounded"});
});



// Display a notification if there was an issue in copying the data associated to all records.
ipcRenderer.on("copyDataFailure", event => {
    M.toast({"html": "There was an issue in copying the data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in deleting the original data associated to all records.
ipcRenderer.on("dataDeleteFailure", event => {
    M.toast({"html": "There was an error in deleting the original data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in copying the library records.
ipcRenderer.on("dataCopyFailure", event => {
    M.toast({"html": "There was an error in copying the original data associated to the records.", "classes": "rounded"});
});



// Display a notification if there was an issue in reading the logs file.
ipcRenderer.on("logsFileReadFailure", event => {
    M.toast({"html": "There was an issue reading the logs file.", "classes": "rounded"});
});



// Display a notification for the successful opening of the logs file.
ipcRenderer.on("logsFileSuccess", event => {
    M.toast({"html": "The folder containing the log files has been opened.", "classes": "rounded"});
    ipcRenderer.send("logsRequest");
});



// Display the modal to be used in asking the user whether the original data folder should be deleted.
ipcRenderer.on("dataOriginalDeleteAsk", (event, response) => {
    // Define the deletion modal.
	const dataDeleteModalInstance = M.Modal.init(document.getElementById("dataDeleteModal"));
    // Open the deletion modal.
	dataDeleteModalInstance.open();
    // Listen for a click on the deny button in order to not delete the previous data records.
    document.getElementById("dataDeleteDeny").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [false, response]);
    });
    // Listen for a click on the accept button in order to delete the previous data records.
    document.getElementById("dataDeleteAccept").addEventListener("click", e => {
    	ipcRenderer.send("dataOriginalDelete", [true, response]);
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all settings choices.
    const settingsOptions = document.getElementById("settingsOptions"),
    	settingsLogs = document.getElementById("settingsLogs"),
        settingsAbout = document.getElementById("settingsAbout"),
        settingsColorReset = document.getElementById("settingsColorReset"),
        settingsDataReset = document.getElementById("settingsDataReset"),
        settingsSizesReset = document.getElementById("settingsSizesReset"),
        aboutGithub = document.getElementById("aboutGithub"),
    	settingsApply = document.getElementById("settingsApply");
    // Define the relevant portions of the page that are in the settings rotation.
    const settingsOptionsContainer = document.getElementById("settingsOptionsContainer"),
        settingsAboutContainer = document.getElementById("settingsAboutContainer"),
        settingsContainers = Array.from(document.getElementsByClassName("settingsContainer")),
        settingsSelectionItems = Array.from(document.getElementsByClassName("settingsSelectionItems")),
        settingsButtons = Array.from(document.getElementsByClassName("settingsButtons")),
        logsTerminal = document.getElementById("logsTerminal"),
        logsFolder = document.getElementById("logsFolder");
    logsFolder.addEventListener("click", e => {
        ipcRenderer.send("logsFile");
    });
    // Listen for a click event on the settingsOptions button on the top bar to display the settings options.
    settingsOptions.addEventListener("click", e => {
        e.preventDefault();
        settingsContainers.forEach(cont => cont.style.display = "none");
        settingsSelectionItems.forEach(item => item.parentNode.classList.remove("active"));
        settingsOptionsContainer.style.display = "initial";
        settingsOptions.parentNode.classList.add("active");
        settingsButtons.forEach(btn => btn.style.display = "inline-block");
        logsFolder.style.display = "none";
    });
    // Listen for a click event on the settingsLogs button on the top bar to display the application logs.
    settingsLogs.addEventListener("click", e => {
        e.preventDefault();
        settingsContainers.forEach(cont => cont.style.display = "none");
        settingsSelectionItems.forEach(item => item.parentNode.classList.remove("active"));
        settingsLogsContainer.style.display = "initial";
        settingsLogs.parentNode.classList.add("active");
        settingsButtons.forEach(btn => btn.style.display = "none");
        logsFolder.style.display = "inline-block";
        ipcRenderer.send("logsRequest");
    });
    ipcRenderer.on("logsRequestResult", (event, logsArr) => {
        logsTerminal.innerHTML = "";
        for(let c = 0; c < logsArr.length; c++) {
            let logSpan = document.createElement("span");
            if(logsArr[c].includes("[info]")) {
                logSpan.textContent = logsArr[c].replace(" [info]", "");
            }
            else if(logsArr[c].includes("[error]")) {
                logSpan.textContent = logsArr[c].replace(" [error]", "");
                logSpan.style.color = "red";
            }
            else if(logsArr[c].includes("[warn]")) {
                logSpan.textContent = logsArr[c].replace(" [warn]", "");
                logSpan.style.color = "blue";
            }
            logsTerminal.append(logSpan, document.createElement("br"));
        }
    });
    // Listen for a click event on the settingsAbout button on the top bar to display the about section of the app.
    settingsAbout.addEventListener("click", e => {
        e.preventDefault();
        settingsContainers.forEach(cont => cont.style.display = "none");
        settingsSelectionItems.forEach(item => item.parentNode.classList.remove("active"));
        settingsAboutContainer.style.display = "initial";
        settingsAbout.parentNode.classList.add("active");
        settingsButtons.forEach(btn => btn.style.display = "none");
        logsFolder.style.display = "none";
    });
    // Listen for a click event on the aboutGithub button in the about section in order to open the associated link in the default browser.
    aboutGithub.addEventListener("click", e => {
        e.preventDefault();
        ipcRenderer.send("aboutGithub");
    });
    // Read the settings configuration file.
    fs.readFile(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8", (err, file) => {
    	// Define the inputs on the settings modal.
    	const primaryColor = document.getElementById("primaryColor"),
    		secondaryColor = document.getElementById("secondaryColor"),
    		appPath = document.getElementById("appPath"),
    		primaryWindowWidth = document.getElementById("primaryWindowWidth"),
    		primaryWindowHeight = document.getElementById("primaryWindowHeight"),
            primaryWindowFullscreen = document.getElementById("primaryWindowFullscreen"),
    		secondaryWindowWidth = document.getElementById("secondaryWindowWidth"),
    		secondaryWindowHeight = document.getElementById("secondaryWindowHeight"),
            secondaryWindowFullscreen = document.getElementById("secondaryWindowFullscreen");
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
            primaryWindowFullscreen.checked = false;
            primaryWindowFullscreen.setAttribute("lastValue", "false");
    		secondaryWindowWidth.value = "1400";
    		secondaryWindowWidth.setAttribute("lastValue", "1400");
    		secondaryWindowHeight.value = "1000";
    		secondaryWindowHeight.setAttribute("lastValue", "1000");
            secondaryWindowFullscreen.checked = false;
            secondaryWindowFullscreen.setAttribute("lastValue", "false");
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
                primaryWindowFullscreen.checked = configData.current.primaryWindowFullscreen;
                primaryWindowFullscreen.setAttribute("lastValue", configData.current.primaryWindowFullscreen);
        		secondaryWindowWidth.value = configData.current.secondaryWindowWidth;
        		secondaryWindowWidth.setAttribute("lastValue", configData.current.secondaryWindowWidth);
        		secondaryWindowHeight.value = configData.current.secondaryWindowHeight;
        		secondaryWindowHeight.setAttribute("lastValue", configData.current.secondaryWindowHeight);
                secondaryWindowFullscreen.checked = configData.current.secondaryWindowFullscreen;
                secondaryWindowFullscreen.setAttribute("lastValue", configData.current.secondaryWindowFullscreen);
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
                primaryWindowFullscreen.checked = configData.original.primaryWindowFullscreen;
                primaryWindowFullscreen.setAttribute("lastValue", configData.original.primaryWindowFullscreen);
        		secondaryWindowWidth.value = configData.original.secondaryWindowWidth;
        		secondaryWindowWidth.setAttribute("lastValue", configData.original.secondaryWindowWidth);
        		secondaryWindowHeight.value = configData.original.secondaryWindowHeight;
        		secondaryWindowHeight.setAttribute("lastValue", configData.original.secondaryWindowHeight);
                secondaryWindowFullscreen.checked = configData.original.secondaryWindowFullscreen;
                secondaryWindowFullscreen.setAttribute("lastValue", configData.original.secondaryWindowFullscreen);
        	}
            // Listen for a click on the color reset button to restore the color inputs to the original values.
            settingsColorReset.addEventListener("click", e => {
                primaryColor.value = configData.original.primaryColor;
                secondaryColor.value = configData.original.secondaryColor;
            });
            // Listen for a click on the path reset button to restore the directory input to the original destination.
            settingsDataReset.addEventListener("click", e => {
                appPath.value = configData.original.path;
                appPath.classList.remove("validate", "valid");
            });
            // Listen for a click on the sizes reset button to restore the sizes of the windows to their original values.
            settingsSizesReset.addEventListener("click", e => {
                primaryWindowWidth.value = configData.original.primaryWindowWidth;
                primaryWindowWidth.classList.remove("validate", "valid");
                primaryWindowHeight.value = configData.original.primaryWindowHeight;
                primaryWindowHeight.classList.remove("validate", "valid");
                secondaryWindowWidth.value = configData.original.secondaryWindowWidth;
                secondaryWindowWidth.classList.remove("validate", "valid");
                secondaryWindowHeight.value = configData.original.secondaryWindowHeight;
                secondaryWindowHeight.classList.remove("validate", "valid");
            });
            // By default load the options section of the settings modal.
        	settingsOptions.click();
        }
        // Read the tutorial.json file.
        fs.readFile(path.join(basePath, "Trak", "config", "tutorial.json"), "UTF8", (err, tutorialInfo) => {
            // Define the settings modal input for the tutorial option.
            const tutorialLoad = document.getElementById("tutorialLoad");
            // If there was an issue in reading the tutorial.json file notify the user.
            if(err) {
                ipcRenderer.send("introductionFileSave", true);
                tutorialLoad.checked = false;
                tutorialLoad.setAttribute("lastValue", "false");
            }
            // If tutorial.json was read successfully, then populate the settings modal accordingly.
            else {
                const tutorialData = JSON.parse(tutorialInfo);
                tutorialLoad.checked = tutorialData.introduction;
                tutorialLoad.setAttribute("lastValue", tutorialData.introduction);
            }
        	// Reset the values in the settings modal upon an exit.
        	const settingsModalInstance = M.Modal.init(document.getElementById("settingsModal"), { "onCloseStart": () => {
                    settingsOptions.click();
        			primaryColor.value = primaryColor.getAttribute("lastValue");
    	    		secondaryColor.value = secondaryColor.getAttribute("lastValue");
    	    		appPath.value = appPath.getAttribute("lastValue");
    	    		appPath.classList.remove("validate", "valid");
    	    		primaryWindowWidth.value = primaryWindowWidth.getAttribute("lastValue");
    	    		primaryWindowWidth.classList.remove("validate", "valid");
    	    		primaryWindowHeight.value = primaryWindowHeight.getAttribute("lastValue");
    	    		primaryWindowHeight.classList.remove("validate", "valid");
                    primaryWindowFullscreen.checked = primaryWindowFullscreen.getAttribute("lastValue") == "true";
    	    		secondaryWindowWidth.value = secondaryWindowWidth.getAttribute("lastValue");
    	    		secondaryWindowWidth.classList.remove("validate", "valid");
    	    		secondaryWindowHeight.value = secondaryWindowHeight.getAttribute("lastValue");
    	    		secondaryWindowHeight.classList.remove("validate", "valid");
                    secondaryWindowFullscreen.checked = secondaryWindowFullscreen.getAttribute("lastValue") == "true";
                    tutorialLoad.checked = tutorialLoad.getAttribute("lastValue") == "true";
        		}
        	});
            // Listen for a click on the apply button in order to submit a back-end request to update the configuration files.
        	settingsApply.addEventListener("click", e => {
                // Format the submitted directory.
        		const submitPath = appPath.value.substring(appPath.value.length - 10) == "\\Trak\\data" ? appPath.value : appPath.value + "\\Trak\\data";
                // Check that the window sizes meet the minimal requirements.
                if(parseInt(primaryWindowWidth.value) >= 1000 && parseInt(primaryWindowHeight.value) >= 800 && parseInt(secondaryWindowWidth.value) >= 1400 && parseInt(secondaryWindowHeight.value) >= 1000) {
            		// Submit a back-end request to update the configuration files.
                    ipcRenderer.send("settingsSave", [
            			submitPath,
        				primaryColor.value,
        				secondaryColor.value,
        				primaryWindowWidth.value,
        				primaryWindowHeight.value,
                        primaryWindowFullscreen.checked,
        				secondaryWindowWidth.value,
        				secondaryWindowHeight.value,
                        secondaryWindowFullscreen.checked,
                        tutorialLoad.checked
            		]);
                    // Close the settings modal.
            		settingsModalInstance.close();
                }
                // Display a notification if the primary window width is too small.
                else if(parseInt(primaryWindowWidth.value) < 1000) {
                    M.toast({"html": "The primary window width has to be at least 1000.", "classes": "rounded"});
                }
                // Display a notification if the primary window height is too small.
                else if(parseInt(primaryWindowHeight.value) < 800) {
                    M.toast({"html": "The primary window width has to be at least 800.", "classes": "rounded"});
                }
                // Display a notification if the secondary window width is too small.
                else if(parseInt(secondaryWindowWidth.value) < 1400) {
                    M.toast({"html": "The secondary window width has to be at least 1400.", "classes": "rounded"});
                }
                // Display a notification if the secondary window height is too small.
                else if(parseInt(secondaryWindowHeight.value) < 1000) {
                    M.toast({"html": "The secondary window width has to be at least 1000.", "classes": "rounded"});
                }
        	});
            // Listen for a change in the path input in order to highlight it accordingly.
        	appPath.addEventListener("change", e => {
        		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        	});
            // Listen for a change in the primary window width input in order to highlight it accordingly.
        	primaryWindowWidth.addEventListener("change", e => {
        		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        	});
            // Listen for a change in the primary window height input in order to highlight it accordingly.
        	primaryWindowHeight.addEventListener("change", e => {
        		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        	});
            // Listen for a change in the secondary window width input in order to highlight it accordingly.
        	secondaryWindowWidth.addEventListener("change", e => {
        		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        	});
            // Listen for a change in the secondary window height input in order to highlight it accordingly.
        	secondaryWindowHeight.addEventListener("change", e => {
        		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
        	});
            // Write the app version based on the version in the package.json file.
            fs.readFile(path.join(basePath, "Trak", "config", "location.json"), "UTF8", (resp, fl) => {
                if(resp) { M.toast({"html": "There was an issue reading the location.json file.", "classes": "rounded"}); }
                else {
                    document.getElementById("appVersion").textContent = "App Version: " + JSON.parse(fs.readFileSync(path.join(JSON.parse(fl).appLocation, "package.json"), "UTF8")).version;
                }
            });
        });
    });
});