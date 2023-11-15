/*

BASIC DETAILS: This file handles all reactions on the index.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.
    - fs and path provide the means to work with local files.
    - basePath is the path to the local settings data.
    - localPath is the path to the local user data.

*/
var { ipcRenderer } = require("electron");
const fs = require("fs"),
    path = require("path"),
    basePath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
if(!fs.existsSync(path.join(basePath, "Trak", "config", "configuration.json"))) {
    var localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
}
else {
    let configObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
    var localPath = configObj.current != undefined
        ? configObj.current.path.substring(0, configObj.current.path.length - 10)
        : configObj.original.path.substring(0, configObj.original.path.length - 10);
}



// Display a notification for the successful removal of multiple records.
ipcRenderer.on("recordsRemovalSuccess", (event, response) => {
    M.toast({"html": "The checked records have been removed.", "classes": "rounded"});
});



// Display a notification if there was an error in the removal of a record.
ipcRenderer.on("recordRemovalFailure", (event, response) => {
    M.toast({"html": "There was an error removing the record associated to the " + toastParse(response) + ".", "classes": "rounded"});
});



// Display a notification for the successful opening of a record's assets directory.
ipcRenderer.on("recordFilesSuccess", (event, response) => {
    M.toast({"html": "The directory containg all files associated to the " + toastParse(response) + " has been opened.", "classes": "rounded"});
});



// Display a notification for the successful opening of the sample zip import directory.
ipcRenderer.on("importSampleZIPSuccess", event => {
    M.toast({"html": "The directory containg the sample zip import has been opened.", "classes": "rounded"});
});



// Display a notification for the successful opening of the sample simple xlsx import directory.
ipcRenderer.on("importSampleSimpleXLSXSuccess", event => {
    M.toast({"html": "The directory containg the sample simple xlsx import has been opened.", "classes": "rounded"});
});


// Display a notification for the successful opening of the sample detailed xlsx import directory.
ipcRenderer.on("importSampleDetailedXLSXSuccess", event => {
    M.toast({"html": "The directory containg the sample detailed xlsx import has been opened.", "classes": "rounded"});
});



// Display a notification if there was an error in the update of the tutorial configuration file.
ipcRenderer.on("introductionFileSaveFailure", event => {
    M.toast({"html": "There was an error in updating the tutorial configuration file.", "classes": "rounded"});
});



// Display a notification if there was an error opening the tutorial configuration file.
ipcRenderer.on("introductionFileReadFailure", event => {
    M.toast({"html": "There was an error in reading the tutorial configuration file.", "classes": "rounded"});
});



// Display a notification for the successful update of the tutorial configuration file.
ipcRenderer.on("introductionFileSaveSuccess", event => {
    M.toast({"html": "The tutorial configuration file has been updated.", "classes": "rounded"});
});



// Display a notification if there was an issue zipping up the library records.
ipcRenderer.on("exportZIPZippingFailure", event => {
    M.toast({"html": "There was an error in zipping up the library records.", "classes": "rounded"});
});



// Display a notification if there was an issue zipping up the assets.
ipcRenderer.on("exportXLSXZippingFailure", event => {
    M.toast({"html": "There was an error in zipping up the library assets.", "classes": "rounded"});
});



// Display a notification if there was an issue unzipping an import file.
ipcRenderer.on("importUnzippingFailure", (event, response) => {
    M.toast({"html": "There was an error in unzipping the import file " + response + ".", "classes": "rounded"});
});



// Display a notification if there was an issue creating the zip file for the database export.
ipcRenderer.on("exportZIPFileFailure", event => {
    M.toast({"html": "There was an error in creating the zip file for the library records export.", "classes": "rounded"});
});



// Display a notification if there was an issue creating the zip file for the database export.
ipcRenderer.on("exportXLSXFileFailure", event => {
    M.toast({"html": "There was an error in creating the zip file for the library records assets export.", "classes": "rounded"});
});



// Display a notification if there was an issue deleting a zip file corresponding to a previous export.
ipcRenderer.on("exportZIPFileDeleteFailure", event => {
    M.toast({"html": "There was an error in deleting the zip file associated to a previous export today.", "classes": "rounded"});
});



// Display a notification if there was an issue deleting a zip file corresponding to a previous export.
ipcRenderer.on("exportXLSXFileDeleteFailure", event => {
    M.toast({"html": "There was an error in deleting the zip file associated to a previous export today.", "classes": "rounded"});
});



// Display a notification if there was an issue saving the contents of an import zip file.
ipcRenderer.on("importZipFileFailure", (event, response) => {
    M.toast({"html": "There was an error in saving the contents of the import file " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful export of the library records.
ipcRenderer.on("exportSuccess", (event, response) => {
    Array.from(document.querySelectorAll(".recordsChecks")).forEach(elem => elem.checked = false);
    document.getElementById("databaseModalExit").click();
    document.getElementById("databasePreloader").style.display = "none";
    document.getElementById("remove").style.display = "none";
    M.toast({"html": "The library records have been exported to " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful import of library records.
ipcRenderer.once("importFileSuccess", (event, response) => {
    M.toast({"html": "The library records have been updated with the contents of the file " + response + ".", "classes": "rounded"});
});



// Display a notification if there was an issue reading the location.json file.
ipcRenderer.on("locationFileIssue", event => {
    M.toast({"html": "There was an issue reading the location.json file.", "classes": "rounded"});
});



// Display a notification if there was an issue reading the location.json file.
ipcRenderer.on("updateDownloadComplete", event => {
    document.getElementById("appUpdate").previousElementSibling.click();
    document.getElementById("updatePreloaderDiv").style.display = "none";
    M.toast({"html": "The update has finished downloading. The app will now close to proceed with the update.", "classes": "rounded"});
});



// IF there is an update then display the button on the index page and wait for the user to confirm that they want to update.
ipcRenderer.on("updateAvailable", (event, response) => {
    // Display the update available button on the top nav of the index page.
    document.getElementById("updateAvailable").style.display = "inline-block";
    // Fill the update modal with content obtained from the github api.
    document.getElementById("updateModalContent").innerHTML = response[3] + "<br>"
        + "More information can be found at: <a id='updateLink' val='" + response[0] + "' class='hyperlink'>Github Release</a>" + "." + "<br><br>"
        + "Current Version: " + response[2] + "<br>" + "Update Version: " + response[1];
    // Listen for a click on the update modal submission button in order to start downloading the updated installer.
    document.getElementById("appUpdate").addEventListener("click", e => {
        // Display the download preloader.
        document.getElementById("updatePreloaderDiv").style.display = "block";
        let updateModalContentDiv = document.getElementById("updateModal").children[0];
        updateModalContentDiv.scrollTo(0, updateModalContentDiv.scrollHeight);
        // Send a request to the back-end for the update process to start.
        ipcRenderer.send("appUpdate", response.slice(4));
    });
    // Listen for a click on the github release link in order to open it in the default browser.
    document.getElementById("updateLink").addEventListener("click", e => {
        ipcRenderer.send("githubRelease", response[0]);
    });
});



// Display the import modal in order to ask the user on whether an imported record should overwrite a record with the same name in the current library.
ipcRenderer.on("importRecordExists", (event, response) => {
    // Define the form to which record checkboxes will be appended for user approval.
    const importModalForm = document.getElementById("importModalForm");
    // Clear the previous list of record checkboxes.
    importModalForm.innerHTML = "";
    // Iterate through each duplicate record and add a checkbox for it.
    response[0].forEach((elem, pos) => {
        let div = document.createElement("div"),
            label = document.createElement("label"),
            input = document.createElement("input"),
            span = document.createElement("span");
        label.classList.add("col", "s12");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", elem);
        input.classList.add("filled-in", "importModalCheckbox");
        span.classList.add("checkboxText");
        span.textContent = response[1][pos][0] + ": " + response[1][pos][1];
        label.append(input, span);
        div.append(label);
        importModalForm.append(div);
    });
    // Open the import modal to ask the user which library records should be overwritten.
    M.Modal.init(document.getElementById("importModal"), { "onCloseStart": () => document.getElementById("databasePreloader").style.display = "none" }).open();
    // Adjust the height of the div containing the checkboxes.
    document.getElementById("importModalFormDiv").style.height = (document.getElementById("importModal").offsetHeight - 220) + "px";
});



// Display the application tutorial for a first-time user or anyone who has not chosen to hide it on launch.
ipcRenderer.on("introduction", (event, response) => {
    // Define the introduction modal used to initialize the tutorial if desired.
    const introductionModal = M.Modal.init(document.getElementById("introductionModal"), { "onCloseStart": () => {
        const introductionCheck = document.getElementById("introductionCheck").checked;
        introductionCheck == true ? ipcRenderer.send("introductionFileSave", false) : ipcRenderer.send("introductionFileSave", true);
    }});
    // Change the text of the introduction modal if this is not the first time the application is being used.
    if(response == true) {
        const par = document.getElementById("introductionContentParagraph");
        par.textContent = par.textContent.replace("Welcome", "Welcome back");
    }
    // Open the introduction modal.
    introductionModal.open();
    // Listen for an update on the checkbox in the introduction modal in order to change the associated option in the settings modal.
    document.getElementById("introductionCheck").addEventListener("change", e => {
        document.getElementById("tutorialLoad").checked = !e.target.checked;
    });
    // Listen for a click on the "Continue" button in the introduction modal in order to start the application tutorial.
    document.getElementById("introductionContinue").addEventListener("click", e => {
        // Define the tutorial step for the adding of a record on the index page.
        const instancesTapAdd = M.TapTarget.init(document.getElementById("introductionTargetAdd"), { "onClose": () => {
            setTimeout(() => {
                // Define the settings configuration data.
                const configurationObj = JSON.parse(fs.readFileSync(path.join(basePath, "Trak", "config", "configuration.json"), "UTF8"));
                // Define the icon color to be utilized throughout the application tutorial.
                let iconColor = "";
                configurationObj.current != undefined ? iconColor = configurationObj.current.primaryColor : iconColor = configurationObj.original.primaryColor;
                // Define the tutorial step for the filter button on the index page.
                const instancesTapFilter = M.TapTarget.init(document.getElementById("introductionTargetFilter"), { "onClose": () => {
                    setTimeout(() => {
                        // Define the tutorial step for the anime search button on the index page.
                        const instancesTapContentSearch = M.TapTarget.init(document.getElementById("introductionTargetContentSearch"), { "onClose": () => {
                            setTimeout(() => {
                                // Define the tutorial step for the export/import button on the index page.
                                const instancesTapDatabase = M.TapTarget.init(document.getElementById("introductionTargetDatabase"), { "onClose": () => {
                                    setTimeout(() => {
                                        // Define the tutorial step for the settings button on the index page.
                                        const instancesTapSettings = M.TapTarget.init(document.getElementById("introductionTargetSettings"));
                                        document.getElementById("openSettings").nextElementSibling.children[1].children[0].children[0].style.color = iconColor;
                                        // Ensure that the tutorial step associated to the settings button opens only once no matter whether the database modal is opened or not.
                                        let cnt = 0;
                                        if(!document.getElementById("databaseModal").classList.contains("open")) {
                                            // After a small delay open the tutorial step for the index page settings.
                                            setTimeout(() => { instancesTapSettings.open(); }, 500);
                                            cnt++;
                                        }
                                        let settingsObserver = new MutationObserver(mutations => {
                                            if(cnt == 0) {
                                                if(!mutations[0].target.classList.contains("open")) {
                                                    setTimeout(() => { instancesTapSettings.open(); }, 500);
                                                    cnt++;
                                                }
                                            }
                                        });
                                        settingsObserver.observe(document.getElementById("databaseModal"), {
                                            attributes: true,
                                            attributeFilter: ["class"]
                                        });
                                    }, 500);
                                }});
                                document.getElementById("openDatabase").nextElementSibling.children[1].children[0].children[0].style.color = iconColor;
                                setTimeout(() => { instancesTapDatabase.open(); }, 500);
                            }, 500);
                        }});
                        document.getElementById("contentSearch").nextElementSibling.children[1].children[0].children[0].style.color = iconColor;
                        // Ensure that the tutorial step associated to the anime search button opens only once no matter whether the filter modal is opened or not.
                        let count = 0;
                        if(!document.getElementById("filterModal").classList.contains("open")) {
                            // After a small delay open the tutorial step for the index page anime search.
                            setTimeout(() => { instancesTapContentSearch.open(); }, 500);
                            count++;
                        }
                        let animeSearchObserver = new MutationObserver(mutations => {
                            if(count == 0) {
                                if(!mutations[0].target.classList.contains("open")) {
                                    setTimeout(() => { instancesTapContentSearch.open(); }, 500);
                                    count++;
                                }
                            }
                        });
                        animeSearchObserver.observe(document.getElementById("filterModal"), {
                            attributes: true,
                            attributeFilter: ["class"]
                        });
                    }, 500);
                }});
                // After a small delay open the tutorial step for the index page filter.
                document.getElementById("setFilter").nextElementSibling.children[1].children[0].children[0].style.color = iconColor;
                setTimeout(() => { instancesTapFilter.open(); }, 500);
            }, 500);
        }});
        // After a small delay open the tutorial step for the adding of a record.
        setTimeout(() => {
            instancesTapAdd.open();
            // If the step is exited via the click of the focused button, then open the addRecord page with the tutorial continued.
            document.getElementById("introductionTargetAdd").nextElementSibling.children[0].addEventListener("click", e => {
                ipcRenderer.send("addLoad", true);
            });
        }, 500);
    });
});



// Load all of the records as rows in the table once the page has loaded.
ipcRenderer.on("loadRows", (event, tableDiff) => {
    // Define the path for all items and get a list of all available records.
    const pathDir = path.join(localPath, "Trak", "data");
    let list = [];
    fs.existsSync(pathDir) ? list = fs.readdirSync(pathDir).filter(file => fs.statSync(path.join(pathDir, file)).isDirectory()) : list = [];
    if(list.length > 0) {
        list = list.sort((lhs, rhs) => {
            let lhsVal = lhs.substring(lhs.indexOf("-")),
                rhsVal = rhs.substring(lhs.indexOf("-"));
            return lhsVal.localeCompare(rhsVal);
        });
    }
    // Attach a row to the html table body for each record.
    const tableDiv = document.getElementById("tableDiv"),
        tableBody = document.getElementById("tableBody"),
        synopsisPreloader = document.getElementById("synopsisPreloader"),
        synopsisModalContent = document.getElementById("synopsisModalContent");
    tableDiv.style.height = (tableDiff + 506) + "px";
    tableBody.textContent = "";
    // Listen for a window resize event in order to change the table height.
    window.addEventListener("resize", () => ipcRenderer.send("getAppHeight"));
    ipcRenderer.on("appHeight", (ev, newTableDiff) => tableDiv.style.height = (newTableDiff + 467) + "px");
    document.getElementById("preloader").style.setProperty("display", "none", "important");
    // Hide the vertical scroll bar.
    document.body.style.overflowY = "hidden";
    // Sort the records alphabetically by default.
    list.sort((a, b) => {
        let nameFunc = str => {
            let cat = str.split("-")[0],
                name = "";
            if(cat == "Anime") {
                name = str.split("-").slice(1).join("-");
            }
            else if(cat == "Book") {
                name = str.split("-").slice(1).join("-");
            }
            return name;
        };
        return nameFunc(a).localeCompare(nameFunc(b));
    });
    // Iterate through each saved record and add a row for each one containing the name, category, and genres of the record.
    for(let n = 0; n < list.length; n++) {
        // Define the items needed to construct the row.
        let tr = document.createElement("tr"),
            tdName = document.createElement("td"),
            tdNameOuterDiv = document.createElement("ul"),
            tdNameDiv = document.createElement("li"),
            tdCategory = document.createElement("td"),
            tdCategoryDiv = document.createElement("div"),
            tdRating = document.createElement("td"),
            tdRatingDiv = document.createElement("div"),
            tdGenres = document.createElement("td"),
            tdGenresDiv = document.createElement("div"),
            tdFiles = document.createElement("td"),
            tdFilesDiv = document.createElement("div"),
            filesButton = document.createElement("button"),
            filesIcon = document.createElement("i"),
            checkLabel = document.createElement("label"),
            checkInput = document.createElement("input"),
            tdCheck = document.createElement("td"),
            recordData = JSON.parse(fs.readFileSync(path.join(localPath, "Trak", "data", list[n], "data.json")));
        // Modify the name portion.
        if(recordData.category == "Anime") {
            tdNameDiv.textContent = recordData.name != "" ? recordData.name : recordData.jname;
        }
        else if(recordData.category == "Book") {
            tdNameDiv.textContent = recordData.name != "" ? recordData.name : formatISBNString(recordData.isbn);
        }
        tdNameDiv.classList.add("recordsNameRowDiv");
        tdName.classList.add("left");
        tdNameOuterDiv.classList.add("recordsNameContainer");
        tdNameOuterDiv.append(tdNameDiv);
        // If a synopsis is availble then create link for it to open the synopsis modal.
        if(recordData.synopsis != undefined && recordData.synopsis.length > 0) {
            // Define the link and icon.
            let tdNameLinkDiv = document.createElement("li"),
                tdNameLink = document.createElement("a"),
                tdNameIcon = document.createElement("i");
            tdNameLink.setAttribute("href", "#synopsisModal");
            tdNameLink.setAttribute("path", path.join(localPath, "Trak", "data", list[n], "data.json"));
            tdNameLink.classList.add("modal-trigger");
            tdNameIcon.textContent = "info";
            tdNameIcon.classList.add("material-icons", "synopsisInfoIcon");
            tdNameLinkDiv.classList.add("synopsisIconDiv");
            // Append the icon and link accordingly.
            tdNameLink.append(tdNameIcon);
            tdNameLinkDiv.append(tdNameLink);
            tdNameOuterDiv.append(tdNameLinkDiv);
            // Listen for a click event on the icon in order to open the synopsis modal.
            tdNameIcon.addEventListener("click", e => {
                synopsisPreloader.style.display = "block";
                fs.readFile(e.target.parentNode.getAttribute("path"), "UTF8", (err, synopsisFile) => {
                    if(err) {
                        if(recordData.category == "Anime") {
                            M.toast({"html": "There was an issue reading the data file associated to the anime " + e.parentNode.parentNode.parentNode.getAttribute("name") + ".", "classes": "rounded"});
                        }
                        else if(recordData.category == "Book") {
                            M.toast({"html": "There was an issue reading the data file associated to the book " +
                                (e.parentNode.parentNode.parentNode.getAttribute("name") != "" ? e.parentNode.parentNode.parentNode.getAttribute("name") : e.parentNode.parentNode.parentNode.getAttribute("isbn")) + ".", "classes": "rounded"});
                        }
                    }
                    else {
                        synopsisPreloader.style.display = "none";
                        synopsisModalContent.innerHTML = JSON.parse(synopsisFile).synopsis.split("").map(elem => elem == "\n" ? "<br>" : elem).join("");
                    }
                });
            });
        }
        tdName.append(tdNameOuterDiv);
        // Modify the category portion.
        tdCategoryDiv.textContent = recordData.category;
        tdCategoryDiv.classList.add("recordsRowDiv", "left");
        tdCategory.append(tdCategoryDiv);
        // Modify the rating portion.
        if(recordData.category == "Anime") {
            let displayRating = "N/A",
                displayRatingArr = [];
            for(let a = 0; a < recordData.content.length; a++) {
                if(recordData.content[a].scenario == "Single") {
                    if(recordData.content[a].rating != "") {
                        displayRatingArr.push(parseInt(recordData.content[a].rating));
                    }
                }
                else if(recordData.content[a].scenario == "Season") {
                    let ratingHolder = 0,
                        ratingHolderArr = [];
                    for(let b = 0; b < recordData.content[a].episodes.length; b++) {
                        if(recordData.content[a].episodes[b].rating != "") {
                            ratingHolderArr.push(parseInt(recordData.content[a].episodes[b].rating));
                        }
                    }
                    if(ratingHolderArr.length > 0) {
                        ratingHolder = (ratingHolderArr.reduce((accum, cur) => accum + cur, 0) / ratingHolderArr.length).toFixed(2);
                        displayRatingArr.push(ratingHolder);
                    }
                }
            }
            if(displayRatingArr.length > 0) { displayRating = (displayRatingArr.reduce((accum, cur) => accum + cur, 0) / displayRatingArr.length).toFixed(2); }
            tdRatingDiv.textContent = displayRating;
        }
        else if(recordData.category == "Book") {
            tdRatingDiv.textContent = recordData.rating != "" ? parseInt(recordData.rating).toFixed(2) : "N/A";
        }
        tdRatingDiv.classList.add("recordsRowDiv", "left");
        tdRating.append(tdRatingDiv);
        // Modify the genres portion.
        let count = 0,
            rowGenreStrArr = [],
            rowGenreInfo = "";
        for(let y = 0; y < recordData.genres[0].length; y++) {
            if(recordData.genres[1][y] == true) {
                rowGenreInfo.length == 0 ? rowGenreInfo = recordData.genres[0][y] : rowGenreInfo += "," + recordData.genres[0][y];
                if(count <= 3) {
                    if(recordData.genres[0][y] == "CGDCT") {
                        rowGenreStrArr.push("CGDCT");
                    }
                    else if(recordData.genres[0][y] == "ComingOfAge") {
                        rowGenreStrArr.push("Coming-of-Age");
                    }
                    else if(recordData.genres[0][y] == "PostApocalyptic") {
                        rowGenreStrArr.push("Post-Apocalyptic");
                    }
                    else if(recordData.genres[0][y] == "SciFi") {
                        rowGenreStrArr.push("Sci-Fi");
                    }
                    else if(recordData.genres[0][y] == "SliceOfLife") {
                        rowGenreStrArr.push("Slice of Life");
                    }
                    else {
                        rowGenreStrArr.push(recordData.genres[0][y].split(/(?=[A-Z])/).join(" "));
                    }
                    count++;
                }
            }
        }
        if(count < 3) {
            for(let z = 0; z < recordData.genres[2].length; z++) {
                if(count <= 3) {
                    rowGenreStrArr.push(recordData.genres[2][z].split(/(?=[A-Z])/).join(" "));
                    count++;
                }
            }
        }
        rowGenreStrArr = rowGenreStrArr.filter(elem => elem != "");
        rowGenreStrArr.sort((a, b) => a.localeCompare(b));
        tdGenresDiv.textContent = count > 3 ? rowGenreStrArr.slice(0, 3).join(", ") + ", ..." : rowGenreStrArr.join(", ");
        tdGenresDiv.classList.add("recordsRowDiv", "left");
        tdGenres.append(tdGenresDiv);
        // Modify the files button to be used for opening the assets folder of a record.
        filesButton.setAttribute("type", "submit");
        filesButton.setAttribute("id", "remove_-_" + list[n]);
        filesButton.classList.add("btn", "waves-effect", "waves-light", "func");
        filesIcon.classList.add("material-icons", "center");
        filesIcon.textContent = "folder_open";
        filesIcon.setAttribute("id", "removeIcon_-_" + list[n]);
        filesButton.append(filesIcon);
        tdFilesDiv.append(filesButton);
        tdFilesDiv.classList.add("recordButtonsRowDiv");
        tdFilesDiv.setAttribute("id", "filesDiv-" + list[n]);
        // Modify the checks associated to each row.
        checkInput.setAttribute("type", "checkbox");
        checkInput.classList.add("filled-in", "recordsChecks");
        checkInput.setAttribute("id", "check_-_" + list[n]);
        checkLabel.append(checkInput);
        tdCheck.append(checkLabel);
        tdFiles.append(tdFilesDiv);
        // Append all portions of the row.
        tr.setAttribute("id", list[n]);
        tr.setAttribute("category", recordData.category);
        tr.setAttribute("name", recordData.name);
        tr.setAttribute("genres", rowGenreInfo);
        tr.setAttribute("directors", recordData.directors);
        if(recordData.category == "Anime") {
            tr.setAttribute("jname", recordData.jname);
            tr.setAttribute("license", recordData.license);
            tr.setAttribute("musicians", recordData.musicians);
            tr.setAttribute("producers", recordData.producers);
            tr.setAttribute("studio", recordData.studio);
            tr.setAttribute("writers", recordData.writers);
        }
        else if(recordData.category == "Book") {
            tr.setAttribute("originalName", recordData.originalName);
            tr.setAttribute("isbn", recordData.isbn);
            tr.setAttribute("authors", recordData.authors);
            tr.setAttribute("publisher", recordData.publisher);
            tr.setAttribute("publicationDate", recordData.publicationDate);
            tr.setAttribute("pages", recordData.pages);
            tr.setAttribute("media", recordData.media);
            tr.setAttribute("lastRead", recordData.lastRead);
        }
        tr.append(tdCheck, tdName, tdCategory, tdRating, tdGenres, tdFiles);
        tableBody.append(tr);
        // Reset the width of the headers table. 
        let difference = document.getElementById("tableDiv").offsetWidth - document.getElementById("tableDiv").clientWidth;
        document.getElementById("headersTable").style.width = "calc(95% - " + difference + "px)";
        // Listen for a change in the input associated to each row checkbox.
        checkInput.addEventListener("change", () => {
            let btn = document.getElementById("remove"),
                checkAllBtn = document.getElementById("checkAll"),
                checkArr = Array.from(document.querySelectorAll(".recordsChecks")),
                checkTotal = checkArr.length,
                checkedNum = checkArr.filter(elem => elem.checked).length;
            checkedNum > 0 ? btn.style.display = "inherit" : btn.style.display = "none";
            checkTotal - 1 == checkedNum && !checkAllBtn.checked ? checkAllBtn.checked = true : checkAllBtn.checked = false;
        });
        // Listen for a click on the name of a record in order to open the update page.
        tdNameDiv.addEventListener("click", e => {
            e.preventDefault();
            ipcRenderer.send("updateRecord", e.target.parentNode.parentNode.parentNode.id);
        });
        // Listen for a click on the files button in order to open the associated assets folder of a record.
        filesButton.addEventListener("click", e => {
            e.preventDefault();
            let holder = e.target.id.split("_-_");
            holder.shift();
            ipcRenderer.send("recordFiles", [holder.join(""), e.target.closest("tr").getAttribute("category") + "-" + e.target.closest("tr").getAttribute("name")]);
        });
    }
    // Initialize the tooltips.
    initTooltips();
    // Initialize the filter genres/tags list.
    genreListLoad("All", 5, true);
    // Initialize the page modals.
    initModal();
    // Initialize the filter modal separately to add the functionality of filter application upon exit.
    M.Modal.init(document.getElementById("filterModal"), { "onCloseStart": () => {
        window.scrollTo(0,0);
        const listHolder = Array.from(document.getElementsByClassName("tabSearchLink")).filter(elem => elem.classList.contains("active")),
            genresList = listHolder.length == 0 || document.getElementById("contentSearch").style.display != "none" ? genreList() : genreList(listHolder[0].textContent),
            genreCheck = [];
        // Define the filtered genres collection.
        for(let j = 0; j < genresList.length; j++) {
            if(document.getElementById("filterGenre" + genresList[j]).checked == true) { genreCheck.push(genresList[j]); }
        }
        // Handle the filtering on the home page.
        if(document.getElementById("contentSearch").style.display != "none") {
            // Define the category and genre arrays along with the record rows.
            const categoryList = ["Anime", "Book", "Film", "Manga", "Show"],
                catCheck = [],
                pageTable = Array.from(document.getElementById("tableBody").children);
            // Define the filtered categories collection.
            for(let i = 0; i < categoryList.length; i++) {
                if(document.getElementById("filterCategory" + categoryList[i]).checked == true) { catCheck.push(categoryList[i]); }
            }
            // Iterate through the records rows to determine if they pass the filter.
            for(let x = 0; x < pageTable.length; x++) {
                // Filter based on both categories and genres.
                if(catCheck.length > 0 && genreCheck.length > 0) {
                    let genreOverall = true,
                        genreSplit = pageTable[x].getAttribute("genres").split(",");
                    for(let y = 0; y < genreCheck.length; y++) {
                        if(!genreSplit.includes(genreCheck[y])) { genreOverall = false; }
                    }
                    genreOverall == true && catCheck.includes(pageTable[x].getAttribute("category")) ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
                }
                // Filter based only on categories.
                else if(catCheck.length > 0 && genreCheck.length == 0) {
                    catCheck.includes(pageTable[x].getAttribute("category")) ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
                }
                // Filter based only on genres.
                else if(catCheck.length == 0 && genreCheck.length > 0) {
                    let genreOverall = true,
                        genreSplit = pageTable[x].getAttribute("genres").split(",");
                    for(let y = 0; y < genreCheck.length; y++) {
                        if(!genreSplit.includes(genreCheck[y])) { genreOverall = false; }
                    }
                    genreOverall == true ? pageTable[x].style.display = "table-row" : pageTable[x].style.display = "none";
                }
                // If the empty filter is applied then show all record rows.
                else { pageTable[x].style.display = "table-row"; }
            }
            // Upon the submission of a filter clear the search bar.
            searchBar.parentNode.children[0].classList.remove("active");
            searchBar.parentNode.children[2].classList.remove("active");
            searchBar.classList.remove("valid");
            searchBar.value = "";
        }
        // Handle the filtering on the anime search page.
        else if(document.getElementById("indexHome").style.display != "none") {
            // Define the anime search items.
            const pageContent = Array.from(document.getElementById("animeSearchContainer").children);
            // Iterate through the search items to determine if they pass the filter.
            for(let y = 0; y < pageContent.length; y++) {
                if(genreCheck.length > 0) {
                    let genreOverall = true,
                        genreSplit = pageContent[y].getAttribute("genres").split(",");
                    for(let y = 0; y < genreCheck.length; y++) {
                        if(!genreSplit.includes(genreCheck[y])) { genreOverall = false; }
                    }
                    genreOverall == true ? pageContent[y].style.display = "inline-block" : pageContent[y].style.display = "none";
                }
                // If the empty filter is applied then show all anime search items.
                else { pageContent[y].style.display = "inline-block"; }
            }
            // Reset the tooltips in order to reset the page scroll height.
            clearTooltips();
            initTooltips();
        }
    }});
});



// Load the results of a content search.
ipcRenderer.on("fetchResult", (event, submissionArr) => {
    // Define the search content container and search inputs.
    const animeContainer = document.getElementById("animeSearchContainer"),
        bookContainer = document.getElementById("bookSearchContainer"),
        preloaderIcon = document.getElementById("synopsisPreloader"),
        synopsisContent = document.getElementById("synopsisModalContent"),
        animeSortSeasonSelect = document.getElementById("animeSeasonSearchSort"),
        animeSortNameSelect = document.getElementById("animeNameSearchSort"),
        bookSortNameSelect = document.getElementById("bookNameSearchSort");
    // Define the array which will contain the search content results.
    let contentArr = [];
    // Hide the preloader.
    document.getElementById("preloader").style.setProperty("display", "none", "important");
    const chunkPreloader = document.getElementById("chunkPreloader"),
        chunkCheck = document.getElementById("chunkCheck");
    chunkPreloader.style.display = "none";
    if(submissionArr[0].length == 0) {
        chunkPreloader.setAttribute(submissionArr[2].toLowerCase() + "Check", "1");
        chunkCheck.style.display = "block";
        setTimeout(() => fadeOut(chunkCheck), 1000);
    }
    // Reset the appropriate search container.
    if(submissionArr[2] == "Anime" && submissionArr[3] == true) {
        animeContainer.innerHTML = "";
    }
    else if(submissionArr[2] == "Book" && submissionArr[3] == true) {
        bookContainer.innerHTML = "";
    }
    // Randomly shuffle the content only on an anime season search for the default display.
    submissionArr[1] == true ? contentArr = shuffle(submissionArr[0]) : contentArr = submissionArr[0];
    // Iterate through the anime search results.
    for(let n = 0; n < contentArr.length; n++) {
        // Define the anime search item image, title, synopsis icon, and rating.
        let itemImg = document.createElement("img"),
            itemContainer = document.createElement("div"),
            itemText = document.createElement("div"),
            itemInfo = document.createElement("div"),
            itemInfoLink = document.createElement("a"),
            itemInfoIcon = document.createElement("i");
        itemContainer.classList.add("searchItemContainer");
        itemContainer.setAttribute("name", contentArr[n][0]);
        itemContainer.setAttribute("rating", contentArr[n][3]);
        itemContainer.setAttribute("genres", contentArr[n][4].join(","));
        itemText.classList.add("seasonItemText", "tooltipped");
        itemText.setAttribute("data-position", "bottom");
        itemText.setAttribute("data-tooltip", contentArr[n][0]);
        itemImg.classList.add("seasonItemImage");
        itemImg.setAttribute("src", contentArr[n][1]);
        itemImg.setAttribute("link", contentArr[n][2]);
        itemImg.setAttribute("type", submissionArr[2]);
        itemText.textContent = contentArr[n][0];
        itemInfo.textContent = contentArr[n][3] + (contentArr[n][3] != "N/A" ? "/10.00" : "");
        itemInfoLink.setAttribute("href", "#synopsisModal");
        itemInfoLink.classList.add("modal-trigger");
        itemInfoIcon.setAttribute("link", contentArr[n][2]);
        itemInfoIcon.classList.add("material-icons", "synopsisInfoIcon", "searchInfoIcon");
        itemInfoIcon.setAttribute("type", submissionArr[2]);
        itemInfoIcon.textContent = "info";
        itemInfoLink.append(itemInfoIcon);
        itemInfo.append(itemInfoLink);
        itemContainer.append(itemImg, itemText, itemInfo);
        if(submissionArr[2] == "Anime") {
            animeContainer.append(itemContainer);
        }
        else if(submissionArr[2] == "Book") {
            bookContainer.append(itemContainer);
        }
        // Listen for a click event on the synopsis icon in order to load the associated synopsis content on the synopsisModal.
        itemInfoIcon.addEventListener("click", e => {
            // Reset the synopsisModal content and show the preloader while the data is fetched.
            synopsisContent.innerHTML = "";
            preloaderIcon.style.display = "block";
            // Fetch the associated synopsis.
            ipcRenderer.send(e.target.getAttribute("type").toLowerCase() + "SynopsisFetch", e.target.getAttribute("link"));
            // Wait for the back-end to provide the synopsis.
            ipcRenderer.on(e.target.getAttribute("type").toLowerCase() + "SynopsisFetchResult", (eve, synopsis) => {
                // Hide the preloader.
                preloaderIcon.style.display = "none";
                // Define the synopsis text.
                let textHolder = synopsis.split("").map(elem => elem == "\n" ? "<br>" : elem).join("").replace("[Written by MAL Rewrite]", "");
                // Clean the synopsis of any source information.
                if(textHolder.includes("(Source:")) {
                    textHolder = textHolder.substring(0, textHolder.indexOf("(Source:"));
                }
                // Trim the synopsis text to remove unnecessary whitespace.
                textHolder = textHolder.trim();
                // Attach the synopsis text to the modal content.
                synopsisContent.innerHTML = textHolder;
            });
        });
        // Listen for a click event on the search item image.
        itemImg.addEventListener("click", e => {
            // Send a request to the back-end in order to load the addRecord page with all the associated details.
            ipcRenderer.send(e.target.getAttribute("type").toLowerCase() + "RecordRequest", e.target.getAttribute("link"));
        });
    }
    // Set the body scroll to auto appear if necessary.
    document.body.style.overflowY = "auto";
    // Clear and initialize the page tooltips.
    clearTooltips();
    initTooltips();
    // Define the function which will handle the sorting of anime search content.
    let sortFunc = e => {
        // Grab the items to sort.
        let sortedArr = [];
        if(submissionArr[2] == "Anime") {
            sortedArr = Array.from(animeContainer.children);
        }
        else if(submissionArr[2] == "Book") {
            sortedArr = Array.from(bookContainer.children);
        }
        // Sort the items by alphabetical order.
        if(e.target.value == "alphabetical") {
            sortedArr = sortedArr.sort((a, b) => a.getAttribute("name").localeCompare(b.getAttribute("name")));
        }
        // Sort the items by reverse alphabetical order.
        else if(e.target.value == "reverseAlphabetical") {
            sortedArr = sortedArr.sort((a, b) => b.getAttribute("name").localeCompare(a.getAttribute("name")));
        }
        // Sort the items from highest to lowest ratings.
        else if(e.target.value == "rating") {
            sortedArr = sortedArr.sort((a, b) => {
                if(a.getAttribute("rating") != "N/A" && b.getAttribute("rating") != "N/A") {
                    return parseFloat(b.getAttribute("rating")) - parseFloat(a.getAttribute("rating"))
                }
                else if(a.getAttribute("rating") == "N/A") { return 1; }
                else if(b.getAttribute("rating") == "N/A") { return -1; }
            });
        }
        // Sort the items from lowest to highest ratings.
        else if(e.target.value == "reverseRating") {
            sortedArr = sortedArr.sort((a, b) => {
                if(a.getAttribute("rating") != "N/A" && b.getAttribute("rating") != "N/A") {
                    return parseFloat(a.getAttribute("rating")) - parseFloat(b.getAttribute("rating"))
                }
                else if(a.getAttribute("rating") == "N/A") { return 1; }
                else if(b.getAttribute("rating") == "N/A") { return -1; }
            });
        }
        // Sort the items randomly.
        else if(e.target.value == "random") {
            sortedArr = shuffle(sortedArr);
            // In the case of a random sort reset the select tags so that another random sort can be applied without having to choose a different sort first.
            if(submissionArr[2] == "Anime") {
                animeSortSeasonSelect.value = "";
                animeSortNameSelect.value = "";
            }
            else if(submissionArr[2] == "Book") {
                bookSortNameSelect.value = "";
            }
            initSelect();
        }
        // Clear the container for the content search items.
        if(submissionArr[2] == "Anime") {
            animeContainer.innerHTML = "";
        }
        else if(submissionArr[2] == "Book") {
            bookContainer.innerHTML = "";
        }
        // Reattach the content search items now that they have been sorted.
        for(let k = 0; k < sortedArr.length; k++) {
            if(submissionArr[2] == "Anime") {
                animeContainer.append(sortedArr[k]);
            }
            else if(submissionArr[2] == "Book") {
                bookContainer.append(sortedArr[k]);
            }
        }
    };
    // Listen for a change in the value of the sorting select tags.
    if(submissionArr[2] == "Anime") {
        animeSortSeasonSelect.addEventListener("change", ev => sortFunc(ev));
        animeSortNameSelect.addEventListener("change", ev => sortFunc(ev));
    }
    else if(submissionArr[2] == "Book") {
        bookSortNameSelect.addEventListener("change", ev => sortFunc(ev));
    }
});