/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

   - animeGenreListLoad: Appends all genre options as checkboxes when adding/updating an anime record.

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
            // If the record is of category type anime then proceed.
            if(recordData.category == "Anime") {
                // Define the relevant anime record inputs.
                const animeName = document.getElementById("animeName"),
                    animeJapaneseName = document.getElementById("animeJapaneseName"),
                    animeReview = document.getElementById("animeReview"),
                    animeSynopsis = document.getElementById("animeSynopsis"),
                    animeDirectors = document.getElementById("animeDirectors"),
                    animeProducers = document.getElementById("animeProducers"),
                    animeWriters = document.getElementById("animeWriters"),
                    animeMusicians = document.getElementById("animeMusicians"),
                    animeStudio = document.getElementById("animeStudio"),
                    animeLicense = document.getElementById("animeLicense"),
                    animeImg = document.getElementById("addRecordAnimeImg");
                // Load the anime record portion of the addRecord page.
                document.getElementById("categoryAnime").click();
                // Populate the anime record page with the saved data.
                animeName.value = recordData.name;
                animeName.setAttribute("lastValue", recordData.name);
                if(recordData.name != "") { animeName.parentNode.children[2].classList.add("active"); }
                animeName.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeName.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeJapaneseName.value = recordData.jname;
                animeJapaneseName.setAttribute("lastValue", recordData.jname);
                if(recordData.jname != "") { animeJapaneseName.parentNode.children[1].classList.add("active"); }
                animeJapaneseName.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeJapaneseName.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeReview.value = recordData.review;
                animeReview.setAttribute("lastValue", recordData.review);
                if(recordData.review != "") {
                    animeReview.parentNode.children[1].classList.add("active");
                    M.textareaAutoResize(animeReview);
                }
                animeReview.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeReview.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeSynopsis.value = recordData.synopsis;
                animeSynopsis.setAttribute("lastValue", recordData.synopsis);
                if(recordData.synopsis != "") {
                    animeSynopsis.parentNode.children[1].classList.add("active");
                    M.textareaAutoResize(animeSynopsis);
                }
                animeSynopsis.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeSynopsis.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeDirectors.value = recordData.directors;
                animeDirectors.setAttribute("lastValue", recordData.directors);
                if(recordData.directors != "") { animeDirectors.parentNode.children[1].classList.add("active"); }
                animeDirectors.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeDirectors.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeProducers.value = recordData.producers;
                animeProducers.setAttribute("lastValue", recordData.producers);
                if(recordData.producers != "") { animeProducers.parentNode.children[1].classList.add("active"); }
                animeProducers.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeProducers.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeWriters.value = recordData.writers;
                animeWriters.setAttribute("lastValue", recordData.writers);
                if(recordData.writers != "") { animeWriters.parentNode.children[1].classList.add("active"); }
                animeWriters.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeWriters.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeMusicians.value = recordData.musicians;
                animeMusicians.setAttribute("lastValue", recordData.musicians);
                if(recordData.musicians != "") { animeMusicians.parentNode.children[1].classList.add("active"); }
                animeMusicians.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeMusicians.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeStudio.value = recordData.studio;
                animeStudio.setAttribute("lastValue", recordData.studio);
                if(recordData.studio != "") { animeStudio.parentNode.children[1].classList.add("active"); }
                animeStudio.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeStudio.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeLicense.value = recordData.license;
                animeLicense.setAttribute("lastValue", recordData.license);
                if(recordData.license != "") { animeLicense.parentNode.children[1].classList.add("active"); }
                animeLicense.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeLicense.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                animeImg.setAttribute("list", recordData.img.join(","));
                animeImg.setAttribute("previous", recordData.img.join(","));
                animeImg.setAttribute("src", recordData.img.length > 0 ? recordData.img[0] : animeImg.getAttribute("default"));
                for(let v = 0; v < recordData.genres[0].length; v++) {
                    document.getElementById("animeGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                }
                // Define the collection of ratings to be used in calculating the global average rating of an anime.
                const rtngList = [];
                // Iterate through the saved related content and add a page item for each.
                for(let u = 1; u < recordData.content.length + 1; u++) {
                    // If the iterated item is of type single then proceed accordingly.
                    if(recordData.content[u-1].scenario == "Single") {
                        singleAddition();
                        document.getElementById("li_" + u + "_Single_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Single_Name").setAttribute("lastValue", recordData.content[u-1].name);
                        if(recordData.content[u-1].name != "") { document.getElementById("li_" + u + "_Single_Name").parentNode.children[1].classList.add("active"); }
                        document.getElementById("li_" + u + "_Single_Name").addEventListener("change", e => {
                            e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                        });
                        document.getElementById("li_" + u + "_Single_Name").addEventListener("click", e => {
                            e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                        });
                        document.getElementById("li_" + u + "_Single_Type").value = recordData.content[u-1].type;
                        document.getElementById("li_" + u + "_Single_Release").value = recordData.content[u-1].release;
                        document.getElementById("li_" + u + "_Single_LastWatched").value = recordData.content[u-1].watched;
                        document.getElementById("li_" + u + "_Single_Rating").value = recordData.content[u-1].rating;
                        document.getElementById("li_" + u + "_Single_Review").value = recordData.content[u-1].review;
                        if(recordData.content[u-1].rating != "") { rtngList.push(parseInt(recordData.content[u-1].rating)); }
                    }
                    // If the iterated item is of type season then proceed accordingly.
                    else if(recordData.content[u-1].scenario == "Season") {
                        seasonAddition();
                        document.getElementById("li_" + u + "_Season_Name").value = recordData.content[u-1].name;
                        document.getElementById("li_" + u + "_Season_Name").setAttribute("lastValue", recordData.content[u-1].name);
                        if(recordData.content[u-1].name != "") { document.getElementById("li_" + u + "_Season_Name").parentNode.children[1].classList.add("active"); }
                        document.getElementById("li_" + u + "_Season_Name").addEventListener("change", e => {
                            e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                        });
                        document.getElementById("li_" + u + "_Season_Name").addEventListener("click", e => {
                            e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                        });
                        document.getElementById("li_" + u + "_Season_Start").value = recordData.content[u-1].start;
                        document.getElementById("li_" + u + "_Season_End").value = recordData.content[u-1].end;
                        document.getElementById("li_" + u + "_Season_Status").value = recordData.content[u-1].status;
                        let seasonRatingList = [];
                        // Iterate through the season episodes and add a listing for each within the season populated with the saved data.
                        for(let w = 1; w < recordData.content[u-1].episodes.length + 1; w++) {
                            episodeAddition(document.getElementById("li_" + u + "_Season"));
                            document.getElementById("li_" + u + "_Episode_Name_" + w).value = recordData.content[u-1].episodes[w-1].name;
                            document.getElementById("li_" + u + "_Episode_Name_" + w).setAttribute("lastValue", recordData.content[u-1].episodes[w-1].name);
                            if(recordData.content[u-1].episodes[w-1].name != "") { document.getElementById("li_" + u + "_Episode_Name_" + w).parentNode.children[1].classList.add("active"); }
                            document.getElementById("li_" + u + "_Episode_Name_" + w).addEventListener("change", e => {
                                e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                            });
                            document.getElementById("li_" + u + "_Episode_Name_" + w).addEventListener("click", e => {
                                e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                            });
                            document.getElementById("li_" + u + "_Episode_LastWatched_" + w).value = recordData.content[u-1].episodes[w-1].watched;
                            document.getElementById("li_" + u + "_Episode_Rating_" + w).value = recordData.content[u-1].episodes[w-1].rating;
                            document.getElementById("li_" + u + "_Episode_Review_" + w).value = recordData.content[u-1].episodes[w-1].review;
                            document.getElementById("li_" + u + "_Episode_Review_" + w).setAttribute("lastValue", recordData.content[u-1].episodes[w-1].review);
                            if(recordData.content[u-1].episodes[w-1].review != "") { document.getElementById("li_" + u + "_Episode_Review_" + w).parentNode.children[1].classList.add("active"); }
                            document.getElementById("li_" + u + "_Episode_Review_" + w).addEventListener("change", e => {
                                e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                            });
                            document.getElementById("li_" + u + "_Episode_Review_" + w).addEventListener("click", e => {
                                e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                            });
                            if(recordData.content[u-1].episodes[w-1].rating != "") { seasonRatingList.push(parseInt(recordData.content[u-1].episodes[w-1].rating)); }
                        }
                        // Push the corresponding item rating to the associated list.
                        let seasonRating = seasonRatingList.length > 0 ? (seasonRatingList.reduce((accum, cur) => accum + cur, 0) / seasonRatingList.length).toFixed(2) : "N/A";
                        document.getElementById("li_" + u + "_Season_AverageRating").value = seasonRating;
                        if(seasonRating != "N/A") { rtngList.push(parseFloat(seasonRating)); }
                        // Initialize the select tags.
                        initSelect();
                    }
                }
                // Write the global average rating of the anime record on the page.
                const animeRtng = rtngList.length > 0 ? (rtngList.reduce((accum, cur) => accum + cur, 0) / rtngList.length).toFixed(2) : "N/A";
                document.getElementById("animeRating").value = animeRtng;
            }
            // Create a div on the page which will house the name of the record as is currently saved in the associated file.
            const oldInfo = document.createElement("div");
            oldInfo.setAttribute("id", "infoDiv");
            oldInfo.setAttribute("title", recordData.name != "" ? recordData.name : recordData.jname);
            oldInfo.style.display = "none";
            document.body.append(oldInfo);
        }
        // Initialize the observer for the select tags.
        initSelectObservers();
    });
});



/*

Appends all genre options as checkboxes when adding/updating an anime record.

*/
var animeGenreListLoad = () => {
    // Define the genres form, list of genres, and number of columns and rows.
    const genresForm = document.getElementById("categoryAnimeForm2"),
        genresLst = animeGenreList(),
        columns = 6,
        rows = Math.ceil(genresLst.length / columns);
    // Iterate through all rows needed.
    for(let r = 0; r < rows; r++) {
        // Construct a div to contain the row.
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("genreRow");
        // Iterate through all columnds needed.
        for(let s = 0; s < columns; s++) {
            // Define the text associated to the genre.
            let filterGenreStr = "";
            if(genresLst[(s * rows) + r] == "CGDCT") {
                filterGenreStr = "CGDCT";
            }
            else if(genresLst[(s * rows) + r] == "ComingOfAge") {
                filterGenreStr = "Coming-of-Age";
            }
            else if(genresLst[(s * rows) + r] == "PostApocalyptic") {
                filterGenreStr = "Post-Apocalyptic";
            }
            else if(genresLst[(s * rows) + r] == "SciFi") {
                filterGenreStr = "Sci-Fi";
            }
            else if(genresLst[(s * rows) + r] == "SliceOfLife") {
                filterGenreStr = "Slice of Life";
            }
            else if(genresLst[(s * rows) + r] != undefined) {
                filterGenreStr = genresLst[(s * rows) + r].split(/(?=[A-Z])/).join(" ");
            }
            else { filterGenreStr = ""; }
            // Define the checkbox, label, and span associated to the genre.
            let genreCheckLabel = document.createElement("label"),
                genereCheckInput = document.createElement("input"),
                genereCheckSpan = document.createElement("span");
            // Modify the page elements.
            genreCheckLabel.classList.add("col", "s2");
            genereCheckInput.setAttribute("type", "checkbox");
            filterGenreStr != "" ? genereCheckInput.setAttribute("id", "animeGenre" + genresLst[(s * rows) + r]) : genreCheckLabel.style.visibility = "hidden";
            genereCheckInput.classList.add("filled-in");
            genereCheckSpan.textContent = filterGenreStr;
            genereCheckSpan.classList.add("checkboxText");
            // Append the checkbox and text to the row.
            genreCheckLabel.append(genereCheckInput, genereCheckSpan);
            rowDiv.append(genreCheckLabel);
        }
        // Append the row to the filter form.
        genresForm.append(rowDiv);
    }
};



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Fill the anime record page with the associated genre options.
    animeGenreListLoad();
    // Initialize the select tags on the page.
    initSelect();
    // Initialize the floating action button on the page.
    initFAB();
    // Initialize the menu tooltips.
    initTooltips()
    // Initialize the modals.
    initModal();
    // Initialize the collapsible divs.
    initCollapsible();
    // Add the listeners corresponding to the record choices.
    recordChoicesButtons();
    // Add the listeners corresponding to the anime record save.
    animeSave();
    // Add the listeners corresponding to the anime related content options.
    animeModalButtons();
    // Initialize the observer for the anime review.
    initAnimeReviewObserver();
    // Initialize the observer for the anime synopsis.
    initAnimeSynopsisObserver();
});