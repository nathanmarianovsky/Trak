/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.
    - fs and path provide the means to work with local files.
    - localPath is the path to the local user data.

*/
var { ipcRenderer } = require("electron");
const fs = require("fs"),
    path = require("path"),
    localPath = process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");



// Display a notification whenever a record already exists with a provided name.
ipcRenderer.on("recordExists", (event, response) => {
    M.toast({"html": "A record for the " + response.replace("-", " ") + " already exists! You can remove or update this record on a separate page.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing to the data file of a record.
ipcRenderer.on("addRecordFailure", (event, response) => {
    M.toast({"html": "There was an issue in writing the data file associated to the " + response.replace("-", " ") + ".", "classes": "rounded"});
});



// Display a notification if there was an issue in writing to the data file of a record.
ipcRenderer.on("updateRecordFailure", (event, response) => {
    M.toast({"html": "There was an issue in writing the data file associated to the " + response.replace("-", " ") + ".", "classes": "rounded"});
});



// Display a notification if there was an error in copying over a specific file.
ipcRenderer.on("copyFailure", (event, response) => {
    M.toast({"html": "There was an error in copying over the file " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful addition of a record.
ipcRenderer.on("addRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + response.replace("-", " ") + " has been created and saved. This window will now close!", "classes": "rounded"});
});



// Display a notification for the successful update of a record.
ipcRenderer.on("updateRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + response.replace("-", " ") + " has been updated. This window will now close!", "classes": "rounded"});
});



// Display a notification if there was an error in renaming a record's directory.
ipcRenderer.on("recordFolderRenameFailure", (event, response) => {
    M.toast({"html": "There was an error in renaming the record folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
});



// Handle the load of record information on the update page.
ipcRenderer.on("recordUpdateInfo", (event, name) => {
    // Attempt to read a record's data file.
    fs.readFile(path.join(localPath, "Trak", "data", name, "data.json"), (err, file) => {
        // Display a notification if there was an error in reading the data file.
        if(err) {
            M.toast({"html": "There was an error opening the data file associated to the " + toastParse(name) + ".", "classes": "rounded"});
        }
        // If the file loaded without issues populate the page with a contact's information.
        else {
            const recordData = JSON.parse(file);
            if(recordData.category == "Anime") {
                document.getElementById("categoryAnime").click();
                document.getElementById("animeName").value = recordData.name;
                document.getElementById("animeJapaneseName").value = recordData.jname;
                document.getElementById("animeReview").value = recordData.review;
                document.getElementById("animeDirectors").value = recordData.directors;
                document.getElementById("animeProducers").value = recordData.producers;
                document.getElementById("animeWriters").value = recordData.writers;
                document.getElementById("animeMusicians").value = recordData.musicians;
                document.getElementById("animeStudio").value = recordData.studio;
                document.getElementById("animeLicense").value = recordData.license;
                for(let v = 0; v < recordData.genres[0].length; v++) {
                    document.getElementById("animeGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                }
                const rtngList = [];
                for(let u = 1; u < recordData.content.length + 1; u++) {
                    if(recordData.content[u-1].scenario == "Single") {
                        singleAddition();
                        document.getElementById("li_" + u + "_Single_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Single_Type").value = recordData.content[u-1].type;
                        document.getElementById("li_" + u + "_Single_Release").value = recordData.content[u-1].release;
                        document.getElementById("li_" + u + "_Single_LastWatched").value = recordData.content[u-1].watched;
                        document.getElementById("li_" + u + "_Single_Rating").value = recordData.content[u-1].rating;
                        document.getElementById("li_" + u + "_Single_Review").value = recordData.content[u-1].review;
                        if(recordData.content[u-1].rating != "") { rtngList.push(parseInt(recordData.content[u-1].rating)); }
                    }
                    else if(recordData.content[u-1].scenario == "Season") {
                        seasonAddition();
                        document.getElementById("li_" + u + "_Season_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Season_Start").value = recordData.content[u-1].start;
                        document.getElementById("li_" + u + "_Season_End").value = recordData.content[u-1].end;
                        document.getElementById("li_" + u + "_Season_Status").value = recordData.content[u-1].status;
                        let seasonRatingList = [];
                        for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                            episodeAddition(document.getElementById("li_" + u + "_Season"));
                            document.getElementById("li_" + u + "_Episode_Name_" + w).value = recordData.content[u-1].episodes[w-1].name;
                            document.getElementById("li_" + u + "_Episode_LastWatched_" + w).value = recordData.content[u-1].episodes[w-1].watched;
                            document.getElementById("li_" + u + "_Episode_Rating_" + w).value = recordData.content[u-1].episodes[w-1].rating;
                            document.getElementById("li_" + u + "_Episode_Review_" + w).value = recordData.content[u-1].episodes[w-1].review;
                            if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                        }
                        let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                        document.getElementById("li_" + u + "_Season_AverageRating").value = seasonRating;
                        if(seasonRating != "N/A") { rtngList.push(parseFloat(seasonRating)); }
                        // Initialize the select tags.
                        initSelect();
                    }
                }
                const animeRtng = rtngList.length > 0 ? (rtngList.reduce((accum, cur) => accum + cur, 0) / rtngList.length).toFixed(2) : "N/A";
                document.getElementById("animeRating").value = animeRtng;
            }
            const oldInfo = document.createElement("div");
            oldInfo.setAttribute("id", "infoDiv");
            oldInfo.setAttribute("title", recordData.name != "" ? recordData.name : recordData.jname);
            oldInfo.style.display = "none";
            document.body.append(oldInfo);
        }
        // Initialize the observer for the anime review.
        initAnimeReviewObserver();
        // Initialize the observer for the select tags.
        initSelectObservers();
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Initialize the select tags on the page.
    const elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
    // Initialize the floating action button on the page.
    const elemsFAB = document.querySelectorAll(".fixed-action-btn"),
        instancesFAB = M.FloatingActionButton.init(elemsFAB, { "hoverEnabled": false, "direction": "left" });
    // Initialize the menu tooltips.
    const elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Initialize the modals.
    const elemsModal = document.querySelectorAll(".modal"),
        instancesModal = M.Modal.init(elemsModal);
    // Initialize the collapsible divs.
    const elemsCollapsible = document.querySelectorAll(".collapsible"),
        instancesCollapsible = M.Collapsible.init(elemsCollapsible);
    // Add the listeners corresponding to the record choices.
    recordChoicesButtons();
    // // Initialize the observer for the anime review.
    // initAnimeReviewObserver();
    // // Initialize the observer for the select tags.
    // initSelectObservers();
    // Add the listeners corresponding to the anime record save.
    animeSave();
    // Add the listeners corresponding to the anime related content options.
    animeModalButtons();
});