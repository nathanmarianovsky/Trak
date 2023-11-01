/*

BASIC DETAILS: This file handles all reactions on the addRecord.html page.

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
    M.toast({"html": "A record for the " + toastParse(response) + " already exists! You can remove or update this record on a separate page.", "classes": "rounded"});
});



// Display a notification if there was an issue in writing to the data file of a record.
ipcRenderer.on("writeRecordFailure", (event, response) => {
    M.toast({"html": "There was an issue in writing the data file associated to the " + toastParse(response) + ".", "classes": "rounded"});
});



// Display a notification if there was an error in copying over a specific file.
ipcRenderer.on("copyFailure", (event, response) => {
    M.toast({"html": "There was an error in copying over the file " + response + ".", "classes": "rounded"});
});



// Display a notification for the successful addition of a record.
ipcRenderer.on("addRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + toastParse(response) + " has been created and saved. This window will now close!", "classes": "rounded"});
});



// Display a notification for the successful update of a record.
ipcRenderer.on("updateRecordSuccess", (event, response) => {
    M.toast({"html": "The record associated to the " + toastParse(response) + " has been updated. This window will now close!", "classes": "rounded"});
});



// Display a notification if there was an error in renaming a record's directory.
ipcRenderer.on("recordFolderRenameFailure", (event, response) => {
    M.toast({"html": "There was an error in renaming the anime record folder " + response[0] + " to " + response[1] + ".", "classes": "rounded"});
});



// If the addRecord page is loading for a new addition then show the initial messanging.
ipcRenderer.on("addRecordInitialMessage", event => {
    document.getElementById("categoryInitial").style.display = "initial";
});



// On an anime details fetch from myanimelist update the name accordingly if the addRecord page opened from an index page anime search.
ipcRenderer.on("animeFetchDetailsResultName", (event, name) => {
    document.getElementById("animeName").value = name;
    document.getElementById("animeName").parentNode.children[2].classList.add("active");
});



// On a record details fetch update the page accordingly if the addRecord page opened from the index page content search.
ipcRenderer.on("searchRecordStart", (event, type) => {
    // Hide the top nav of the addRecord page.
    document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display = "none";
    // Define the addRecord preloader and display it while the data is being fetched and page is populated with the associated data.
    const animeRecordPreloader = document.getElementById("animePreloader"),
        bookRecordPreloader = document.getElementById("bookPreloader"),
        animeRecordSave = document.getElementById("animeSave"),
        bookRecordSave = document.getElementById("bookSave"),
        animeRecordOptions = document.getElementById("animeOptions"),
        animeRecordMoreDetailsBtn = document.getElementById("animeMoreDetailsBtn"),
        animeRecordFetchDetailsBtn = document.getElementById("animeFetchDetailsBtn"),
        bookRecordFetchDetailsBtn = document.getElementById("bookFetchDetailsBtn");
    if(type == "Anime") {
        // Hide the page buttons until all data has loaded in.
        animeRecordPreloader.style.top = "-32px";
        animeRecordPreloader.style.visibility = "visible";
        animeRecordSave.style.visibility = "hidden";
        animeRecordOptions.style.visibility = "hidden";
        animeRecordMoreDetailsBtn.style.visibility = "hidden";
        animeRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the anime record portion of the addRecord page.
        document.getElementById("categoryAnime").click();
        document.getElementById("categoryAnimeDiv").children[0].style.marginTop = "3%";
    }
    else if(type == "Book") {
        // Hide the page buttons until all data has loaded in.
        bookRecordPreloader.style.top = "-32px";
        bookRecordPreloader.style.visibility = "visible";
        bookRecordSave.style.visibility = "hidden";
        bookRecordFetchDetailsBtn.style.visibility = "hidden";
        // Load the book record portion of the addRecord page.
        document.getElementById("categoryBook").click();
        document.getElementById("categoryBookDiv").children[0].style.marginTop = "3%";
    }
});



// Handle the load of record information on the update page.
ipcRenderer.on("recordUpdateInfo", (event, name) => {
    // Hide the top nav of the addRecord page.
    document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display = "none";
    // Define the addRecord preloader and display it while the data file is read and page is populated with the associated data.
    const updateRecordPreloader = document.getElementById("updateRecordPreloader");
    updateRecordPreloader.style.display = "block";
    // Attempt to read a record's data file.
    fs.readFile(path.join(localPath, "Trak", "data", name, "data.json"), (err, file) => {
        // Display a notification if there was an error in reading the data file.
        if(err) {
            M.toast({"html": "There was an error opening the data file associated to the " + toastParse(name) + ".", "classes": "rounded"});
        }
        // If the file loaded without issues populate the page with a record's information.
        else {
            const recordData = JSON.parse(file);
            // If the record is of category type anime then proceed.
            if(recordData.category == "Anime") {
                const animeSave = document.getElementById("animeSave"),
                    animeOptions = document.getElementById("animeOptions"),
                    animeMoreDetailsBtn = document.getElementById("animeMoreDetailsBtn"),
                    animeFetchDetailsBtn = document.getElementById("animeFetchDetailsBtn");
                // Hide the page buttons until all data has loaded in.
                animeSave.style.visibility = "hidden";
                animeOptions.style.visibility = "hidden";
                animeMoreDetailsBtn.style.visibility = "hidden";
                animeFetchDetailsBtn.style.visibility = "hidden";
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
                document.getElementById("categoryAnimeDiv").children[0].style.marginTop = "3%";
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
                animeImg.setAttribute("src", recordData.img.length > 0 && recordData.img[0] != "" ? recordData.img[0] : animeImg.getAttribute("default"));
                const animeFavImgLink = document.getElementById("animeFavoriteImageLink");
                if(!animeImg.getAttribute("src").includes("imgDef.png")) {
                    animeFavImgLink.style.visibility = "visible";
                }
                animeFavImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
                for(let v = 0; v < recordData.genres[0].length; v++) {
                    document.getElementById("animeGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                }
                document.getElementById("otherGenres").value = recordData.genres[2].join(", ");
                // Display a preloader to indicate that the page is still loading the anime related content. This can take a bit of time depending on the amount to be loaded.
                const updateAnimePreloader = document.getElementById("animePreloader");
                updateAnimePreloader.style.top = "-32px";
                updateAnimePreloader.style.visibility = "visible";
                setTimeout(() => {
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
                    // Display all page buttons now that all data has loaded.
                    animeSave.style.visibility = "visible";
                    animeOptions.style.visibility = "visible";
                    animeMoreDetailsBtn.style.visibility = "visible";
                    animeFetchDetailsBtn.style.visibility = "visible";
                    // Hide the anime preloader to indicate that the related content has finished loading.
                    updateAnimePreloader.style.visibility = "hidden";
                }, 500)
                animeName.setAttribute("oldName", recordData.name != "" ? recordData.name : recordData.jname);
            }
            // If a record is of category type book then proceed.
            else if(recordData.category == "Book") {
                // Define the relevant book record inputs.
                const bookTitle = document.getElementById("bookTitle"),
                    bookOriginalTitle = document.getElementById("bookOriginalTitle"),
                    bookISBN = document.getElementById("bookISBN"),
                    bookAuthor = document.getElementById("bookAuthor"),
                    bookPublisher = document.getElementById("bookPublisher"),
                    bookPublicationDate = document.getElementById("bookPublicationDate"),
                    bookPages = document.getElementById("bookPages"),
                    bookMediaType = document.getElementById("bookMediaType"),
                    bookLastRead = document.getElementById("bookLastRead"),
                    bookSynopsis = document.getElementById("bookSynopsis"),
                    bookRating = document.getElementById("bookRating"),
                    bookReview = document.getElementById("bookReview"),
                    bookImg = document.getElementById("addRecordBookImg");
                // Load the book record portion of the addRecord page.
                document.getElementById("categoryBook").click();
                document.getElementById("categoryBookDiv").children[0].style.marginTop = "3%";
                // Populate the book record page with the saved data.
                bookTitle.value = recordData.name;
                bookTitle.setAttribute("lastValue", recordData.name);
                if(recordData.name != "") { bookTitle.parentNode.children[2].classList.add("active"); }
                bookTitle.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookTitle.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookOriginalTitle.value = recordData.originalName;
                bookOriginalTitle.setAttribute("lastValue", recordData.originalName);
                // if(recordData.originalName != "") { bookOriginalTitle.parentNode.children[1].classList.add("active"); }
                bookOriginalTitle.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookOriginalTitle.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookReview.value = recordData.review;
                bookReview.setAttribute("lastValue", recordData.review);
                if(recordData.review != "") {
                    bookReview.parentNode.children[1].classList.add("active");
                    M.textareaAutoResize(bookReview);
                }
                bookReview.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookReview.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookSynopsis.value = recordData.synopsis;
                bookSynopsis.setAttribute("lastValue", recordData.synopsis);
                if(recordData.synopsis != "") {
                    bookSynopsis.parentNode.children[1].classList.add("active");
                    M.textareaAutoResize(bookSynopsis);
                }
                bookSynopsis.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookSynopsis.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookISBN.value = recordData.isbn;
                bookISBN.setAttribute("lastValue", recordData.isbn);
                if(recordData.isbn != "") { bookISBN.parentNode.children[1].classList.add("active"); }
                formatISBN(bookISBN);
                bookISBN.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookISBN.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookAuthor.value = recordData.authors;
                bookAuthor.setAttribute("lastValue", recordData.authors);
                if(recordData.authors != "") { bookAuthor.parentNode.children[1].classList.add("active"); }
                bookAuthor.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookAuthor.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPublisher.value = recordData.publisher;
                bookPublisher.setAttribute("lastValue", recordData.publisher);
                if(recordData.publisher != "") { bookPublisher.parentNode.children[1].classList.add("active"); }
                bookPublisher.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPublisher.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPublicationDate.value = recordData.publicationDate;
                bookPublicationDate.setAttribute("lastValue", recordData.publicationDate);
                if(recordData.publicationDate != "") { bookPublicationDate.parentNode.children[1].classList.add("active"); }
                bookPublicationDate.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPublicationDate.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPages.value = recordData.pages;
                bookPages.setAttribute("lastValue", recordData.pages);
                if(recordData.pages != "") { bookPages.parentNode.children[1].classList.add("active"); }
                bookPages.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookPages.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookLastRead.value = recordData.lastRead;
                bookLastRead.setAttribute("lastValue", recordData.lastRead);
                if(recordData.lastRead != "") { bookLastRead.parentNode.children[1].classList.add("active"); }
                bookLastRead.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookLastRead.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookMediaType.value = recordData.media;
                bookMediaType.setAttribute("lastValue", recordData.media);
                // if(recordData.media != "") { bookMediaType.nextElementSibling.classList.add("active"); }
                bookMediaType.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookMediaType.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookImg.setAttribute("list", recordData.img.join(","));
                bookImg.setAttribute("previous", recordData.img.join(","));
                bookImg.setAttribute("src", recordData.img.length > 0 && recordData.img[0] != "" ? recordData.img[0] : bookImg.getAttribute("default"));
                const bookFavImgLink = document.getElementById("bookFavoriteImageLink");
                if(!bookImg.getAttribute("src").includes("imgDef.png")) {
                    bookFavImgLink.style.visibility = "visible";
                }
                bookFavImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
                for(let v = 0; v < recordData.genres[0].length; v++) {
                    document.getElementById("bookGenre" + recordData.genres[0][v]).checked = recordData.genres[1][v];
                }
                const otherGenres = document.getElementById("otherGenres");
                otherGenres.value = recordData.genres[2].join(", ");
                if(recordData.genres[2].length > 0) { otherGenres.nextElementSibling.classList.add("active"); }
                otherGenres.setAttribute("lastValue", recordData.genres[2].join(", "));
                otherGenres.addEventListener("change", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                otherGenres.addEventListener("click", e => {
                    e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
                });
                bookTitle.setAttribute("oldISBN", recordData.isbn);
                bookTitle.setAttribute("oldName", recordData.name);
            }
        }
        // Hide the addRecord preloader once the file data has been added.
        updateRecordPreloader.style.display = "none";
        // Initialize the observer for the select tags.
        initSelectObservers();
    });
});



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Fill the anime record page with the associated genre options.
    genreListLoad("Anime", 6);
    // Fill the book record page with the associated genre options.
    genreListLoad("Book", 6);
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
    // Add the listeners corresponding to the book record save.
    bookSave();
    // Add the listeners corresponding to the anime related content options.
    animeModalButtons();
    const categories = ["anime", "book"];
    categories.forEach(category => {
        // Initialize the observer for the review.
        initReviewObserver(document.getElementById(category + "Review"));
        // Initialize the observer for the synopsis.
        initSynopsisObserver(document.getElementById(category + "Synopsis"));
    });
});