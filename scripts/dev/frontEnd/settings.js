/*

BASIC DETAILS: This file handles all settings activity.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



// Wait for the window to finish loading.
window.addEventListener("load", () => {
	// Define the buttons for all settings choices.
    const settingsOptions = document.getElementById("settingsOptions"),
    	settingsAbout = document.getElementById("settingsAbout"),
    	settingsExit = document.getElementById("settingsExit");
    // Define the relevant portions of the page that are in the settings rotation.
    const settingsOptionsContainer = document.getElementById("settingsOptionsContainer");
    // Listen for a click event on the settingsWindows button on the top bar to display the windows settings.
    settingsOptions.addEventListener("click", e => {
        e.preventDefault();
        settingsOptionsContainer.style.display = "initial";
        settingsOptions.parentNode.classList.add("active");
    });
    // Read the settings configuration file.
    fs.readFile(path.join(localPath, "Trak", "config", "configuration.json"), (err, file) => {
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

        }
    	settingsOptions.click();
    	// Reset the values in the settings modal upon an exit.
    	M.Modal.init(document.getElementById("settingsModal"), { "onCloseStart": () => {
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
    	document.getElementById("appPath").addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	document.getElementById("primaryWindowWidth").addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	document.getElementById("primaryWindowHeight").addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	document.getElementById("secondaryWindowWidth").addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    	document.getElementById("secondaryWindowHeight").addEventListener("change", e => {
    		e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    	});
    });
});