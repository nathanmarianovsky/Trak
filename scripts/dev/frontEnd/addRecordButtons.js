/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

    - recordChoicesButtons: Listen for click events on the record choices.
    - animeModalButtons: Listen for click events on the related content anime modal buttons.
    - animeSave: Processes the information required to save an anime record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Listen for click events on the record choices.

*/
var recordChoicesButtons = () => {
    // Define the buttons for all record choices.
    const categoryAnime = document.getElementById("categoryAnime");
    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryInitial = document.getElementById("categoryInitial"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv");
    let introHolder = false;
    ipcRenderer.on("addIntroduction", event => { introHolder = true; });
    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        if(categoryInitial.style.display != "none") {
            categoryInitial.style.display = "none";
        }
        else if(!categoryAnime.parentNode.classList.contains("active")) {
            categoryDivs.style.display = "none";
        }
        categoryAnimeDiv.style.display = "initial";
        categoryAnime.parentNode.classList.add("active");
        // Initialize the dragging of the related content.
        let drake = dragula({"containers": [document.querySelector('#animeList')]});
        drake.on("dragend", () => { animeListReorganize(); });

        const animeName = document.getElementById("animeName"),
            animeNameAutocomplete = M.Autocomplete.init(animeName, { "sortFunction": (a, b) => a.localeCompare(b) });
            animeNameUL = animeName.nextElementSibling;
        let previousName = "",
            maxCharCount = 0;
        animeName.addEventListener("input", e => {
            if(e.target.value.length > 2) {
                ipcRenderer.send("animeSearch", [previousName, e.target.value]);
            }
            else { animeNameAutocomplete.updateData({}); }
            previousName = e.target.value;
        });
        animeName.addEventListener("click", e => {
            if(e.target.value.length > 2) {
                ipcRenderer.send("animeSearch", [previousName, e.target.value]);
            }
            else { animeNameAutocomplete.updateData({}); }
        });
        ipcRenderer.on("animeSearchResults", (event, response) => {
            console.log(response);
            if(response[2].length > 0) {
                let autoObj = {};
                response[2] = response[2].sort((a, b) => a[0].localeCompare(b[0]));
                maxCharCount = Math.floor(((3/19) * (animeName.getBoundingClientRect().width - 467)) + 35);
                for(let t = 0; t < response[2].length; t++) {
                    if(response[2][t][0].length > maxCharCount) {
                        let z = 3;
                        while(true) {
                            if(!autoObj.hasOwnProperty(response[2][t][0].substring(0, maxCharCount).concat(new Array(z).fill(".").join("")))) {
                                autoObj[response[2][t][0].substring(0, maxCharCount).concat(new Array(z).fill(".").join(""))] = response[2][t][2];
                                break;
                            }
                            z++;
                        }
                        // autoObj[response[2][t][0].substring(0, maxCharCount).concat("...")] = response[2][t][2];
                    }
                    else {
                        autoObj[response[2][t][0]] = response[2][t][2];
                    }
                }
                animeNameAutocomplete.updateData(autoObj);
                if(response[0].length == 2 && response[1].length == 3) {
                    animeNameUL.style.display = "none";
                    animeName.click();
                    setTimeout(() => { animeName.click(); animeNameUL.style.display = "block"; }, 100);
                }
                setTimeout(() => {
                    for(let u = 0; u < animeNameUL.children.length; u++) {
                        let curChild = animeNameUL.children[u];
                        for(let v = 0; v < response[2].length; v++) {
                            if(curChild.children[0].getAttribute("src") == response[2][v][2]) {
                                curChild.setAttribute("name", response[2][v][0]);
                                curChild.setAttribute("jname", response[2][v][1]);
                                curChild.setAttribute("image", response[2][v][2]);
                                curChild.setAttribute("start", response[2][v][3]);
                                curChild.setAttribute("end", response[2][v][4]);
                                curChild.setAttribute("type", response[2][v][5]);
                                curChild.setAttribute("episodes", response[2][v][6]);
                                curChild.setAttribute("genres", response[2][v][7].join(","));
                                curChild.setAttribute("studios", response[2][v][8].join(", "));
                                curChild.addEventListener("click", eve => {
                                    eve.preventDefault();
                                    let curItem = eve.target.closest("li");
                                    setTimeout(() => { animeName.value = curItem.getAttribute("name"); }, 100);
                                    document.getElementById("animeJapaneseName").value = "";
                                    document.getElementById("animeJapaneseName").classList.remove("valid");
                                    document.getElementById("animeJapaneseName").nextElementSibling.classList.remove("active");
                                    if(curItem.getAttribute("jname").length > 0) {
                                        document.getElementById("animeJapaneseName").value = curItem.getAttribute("jname");
                                        document.getElementById("animeJapaneseName").classList.add("valid");
                                        document.getElementById("animeJapaneseName").nextElementSibling.classList.add("active");
                                    }
                                    document.getElementById("animeStudio").value = "";
                                    document.getElementById("animeStudio").classList.remove("valid");
                                    document.getElementById("animeStudio").nextElementSibling.classList.remove("active");
                                    if(curItem.getAttribute("studios").length > 0) {
                                        document.getElementById("animeStudio").value = curItem.getAttribute("studios");
                                        document.getElementById("animeStudio").classList.add("valid");
                                        document.getElementById("animeStudio").nextElementSibling.classList.add("active");
                                    }
                                    Array.from(document.querySelectorAll(".genreRow .filled-in")).forEach(inp => inp.checked = false);
                                    let possibleGenres = curItem.getAttribute("genres").split(",");
                                    possibleGenres.forEach(genreItem => {
                                        let genreIter = genreItem;
                                        if(genreIter == "Coming-Of-Age") {
                                            genreIter = "ComingOfAge";
                                        }
                                        else if(genreIter == "Post-Apocalyptic") {
                                            genreIter = "PostApocalyptic";
                                        }
                                        else if(genreIter == "Sci-Fi") {
                                            genreIter = "SciFi";
                                        }
                                        else if(genreIter == "Slice of Life") {
                                            genreIter = "SliceOfLife";
                                        }
                                        if(document.getElementById("animeGenre" + genreIter) != undefined) {
                                            document.getElementById("animeGenre" + genreIter).checked = true;
                                        }
                                    });
                                });
                            }
                        }
                    }
                }, 500);
            }
            else { animeNameAutocomplete.updateData({}); }
        });
        // window.addEventListener("resize", e => {
        //     maxCharCount = Math.floor(((3/19) * (animeName.getBoundingClientRect().width - 467)) + 35);
        //     animeNameUL.children.forEach(child => {
        //         if(child.getAttribute("name") > maxCharCount) {
        //             let w = 3;
        //             while(true) {
        //                 if(!autoObj.hasOwnProperty(response[2][t][0].substring(0, maxCharCount).concat(new Array(w).fill(".").join("")))) {
        //                     autoObj[response[2][t][0].substring(0, maxCharCount).concat(new Array(w).fill(".").join(""))] = response[2][t][2];
        //                     break;
        //                 }
        //                 w++;
        //             }
        //         }
        //         child.children[1].textContent.length > maxCharCount
        //             ? child.children[1].textContent = child.getAttribute("name").substring(0, maxCharCount).concat("...")
        //             : child.children[1].textContent = child.getAttribute("name");
        //     });
        // });
        



        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        if(introHolder == true) {
            const instancesTapAnimeSave = M.TapTarget.init(document.getElementById("introductionTargetAnimeSave"), { "onClose": () => {
                setTimeout(() => {
                    const instancesTapAnimeOptions = M.TapTarget.init(document.getElementById("introductionTargetAnimeOptions"));
                    setTimeout(() => { instancesTapAnimeOptions.open(); }, 500);
                }, 500);
            }});
            setTimeout(() => { instancesTapAnimeSave.open(); }, 500);
        }
    });
};



/*

Listen for click events on the related content anime modal buttons.

*/
var animeModalButtons = () => {
    // Define the buttons for all actions.
    const animeAddSingle = document.getElementById("animeAddSingle"),
        animeAddSeason = document.getElementById("animeAddSeason");
    // Listen for a click event on the anime related content film/ONA/OVA creation button.
    animeAddSingle.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new film/ONA/OVA.
        singleAddition();
    });
    // Listen for a click event on the animeAddSeason button on the anime associated modal to add a season listing.
    animeAddSeason.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new season.
        seasonAddition();
    });
};



/*

Processes the information required to save an anime record.

*/
var animeSave = () => {
    // Define the page save button.
    const animeSaveBtn = document.getElementById("animeSave");
    // Listen for a click on the save button.
    animeSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const animeList = document.getElementById("animeList"),
            animeName = document.getElementById("animeName").value,
            animeJapaneseName = document.getElementById("animeJapaneseName").value,
            animeReview = document.getElementById("animeReview").value,
            animeDirectors = document.getElementById("animeDirectors").value,
            animeProducers = document.getElementById("animeProducers").value,
            animeWriters = document.getElementById("animeWriters").value,
            animeMusicians = document.getElementById("animeMusicians").value,
            animeStudio = document.getElementById("animeStudio").value,
            animeLicense = document.getElementById("animeLicense").value,
            animeFiles = Array.from(document.getElementById("animeAddRecordFiles").files).map(elem => elem.path),
            genresLst = animeGenreList(),
            genres = [],
            content = [];
        // Check to see that at least one name was provided.
        if(animeName != "" || animeJapaneseName != "") {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("animeGenre" + genresLst[p]).checked);
            }
            // For each table item in the related content table process the associated information.
            for(let q = 1; q < animeList.children.length + 1; q++) {
                let animeListChild = animeList.children[q - 1],
                    animeListChildCondition = animeListChild.id.split("_")[2],
                    curContent = [];
                // Attain the details on a film/ONA/OVA.
                if(animeListChildCondition == "Single") {
                    let singleName = document.getElementById("li_" + q + "_Single_Name").value,
                        singleType = document.getElementById("li_" + q + "_Single_Type").value,
                        singleRelease = document.getElementById("li_" + q + "_Single_Release").value,
                        singleLastWatched = document.getElementById("li_" + q + "_Single_LastWatched").value,
                        singleRating = document.getElementById("li_" + q + "_Single_Rating").value,
                        singleReview = document.getElementById("li_" + q + "_Single_Review").value;
                    curContent.push("Single", singleName, singleType, singleRelease, singleLastWatched, singleRating, singleReview);
                }
                // Attain the details on a season and its episodes.
                else if(animeListChildCondition == "Season") {
                    let seasonName = document.getElementById("li_" + q + "_Season_Name").value,
                        seasonStart = document.getElementById("li_" + q + "_Season_Start").value,
                        seasonEnd = document.getElementById("li_" + q + "_Season_End").value,
                        seasonStatus = document.getElementById("li_" + q + "_Season_Status").value,
                        seasonEpisodes = [];
                    for(let r = 1; r < animeListChild.children[1].children[0].children.length + 1; r++) {
                        let seasonEpisodeName = document.getElementById("li_" + q + "_Episode_Name_" + r).value,
                            seasonEpisodeLastWatched = document.getElementById("li_" + q + "_Episode_LastWatched_" + r).value,
                            seasonEpisodeRating = document.getElementById("li_" + q + "_Episode_Rating_" + r).value,
                            seasonEpisodeReview = document.getElementById("li_" + q + "_Episode_Review_" + r).value;
                        seasonEpisodes.push([seasonEpisodeName, seasonEpisodeLastWatched, seasonEpisodeRating, seasonEpisodeReview]);
                    }
                    curContent.push("Season", seasonName, seasonStart, seasonEnd, seasonStatus, seasonEpisodes);
                }
                // Push the table item information into the array holding all related content details.
                content.push(curContent);
            }
            const pageElement = document.getElementById("infoDiv"),
                oldTitle = typeof(pageElement) != "undefined" && pageElement != null ? pageElement.title : "";
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Anime", animeName, animeJapaneseName, animeReview, animeDirectors, animeProducers,
                animeWriters, animeMusicians, animeStudio, animeLicense, animeFiles, [genresLst, genres], content, oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "An anime record requires that either an English or Japanese name is provided.", "classes": "rounded"}); }
    });
};