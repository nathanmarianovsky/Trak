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
        // Hide the default content.
        if(categoryInitial.style.display != "none") {
            categoryInitial.style.display = "none";
        }
        // Hide all page content by default if the anime content is not shown.
        else if(!categoryAnime.parentNode.classList.contains("active")) {
            categoryDivs.style.display = "none";
        }
        // Show the anime content and highlight the anime tab of the navbar.
        categoryAnimeDiv.style.display = "initial";
        categoryAnime.parentNode.classList.add("active");
        // Initialize the dragging of the related content.
        let drake = dragula({"containers": [document.querySelector('#animeList')]});
        drake.on("dragend", () => { animeListReorganize(); });
        // Define the portions of the page associated to the autocomplete 
        const animeName = document.getElementById("animeName"),
            animeNameAutocomplete = M.Autocomplete.init(animeName, { "sortFunction": (a, b) => a.localeCompare(b) }),
            animeNameUL = animeName.nextElementSibling,
            animePreloader = document.getElementById("animePreloader");
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "",
            maxCharCount = 0;
        // Listen for an input change in the anime name in order to fetch autocomplete options from myanimelist.
        animeName.addEventListener("input", e => {
            // Only fetch myanimelist options if the anime name is of at least three characters.
            if(e.target.value.length > 2) {
                ipcRenderer.send("animeSearch", [previousName, e.target.value]);
            }
            else { animeNameAutocomplete.updateData({}); }
            // Set the previous search value to the current one.
            previousName = e.target.value;
        });
        // Listen for a click event on the anime name in order to trigger a fetch of autocomplete options from myanimelist.
        animeName.addEventListener("click", e => {
            // Only fetch myanimelist options if the anime name is of at least three characters.
            if(e.target.value.length > 2) {
                ipcRenderer.send("animeSearch", [previousName, e.target.value]);
            }
            else { animeNameAutocomplete.updateData({}); }
        });
        // Once the autocomplete options have been attained update the page accordingly.
        ipcRenderer.on("animeSearchResults", (event, response) => {
            // Proceed only if there are options available for autocomplete.
            if(response[2].length > 0) {
                // Define the object which will be used to update the autocomplete options.
                let autoObj = {};
                // Set the max character count based on the width of the page anime name input.
                maxCharCount = Math.floor(((20/190) * (animeName.getBoundingClientRect().width - 467)) + 38);
                // Iterate through all attained autocomplete options.
                for(let t = 0; t < response[2].length; t++) {
                    // If the autocomplete option has a name which is too long truncate it properly and add it as a page option.
                    if(response[2][t][0].length > maxCharCount) {
                        let z = 3;
                        while(true) {
                            if(!autoObj.hasOwnProperty(response[2][t][0].substring(0, maxCharCount).concat(new Array(z).fill(".").join("")))) {
                                autoObj[response[2][t][0].substring(0, maxCharCount).concat(new Array(z).fill(".").join(""))] = response[2][t][1];
                                break;
                            }
                            z++;
                        }
                    }
                    // If no truncation is necessary simply add the name as is as a page option.
                    else {
                        autoObj[response[2][t][0]] = response[2][t][1];
                    }
                }
                // Update the page autocomplete options.
                animeNameAutocomplete.updateData(autoObj);
                // In the case where the user is going from two to three characters, a refocus is necessary to make the unordered list for the autocomplete options to function properly.
                if(response[0].length == 2 && response[1].length == 3) {
                    animeNameUL.style.display = "none";
                    animeName.click();
                    setTimeout(() => { animeName.click(); animeNameUL.style.display = "block"; }, 100);
                }
                // After a delay the list items for autocomplete options are provided the associated information in order to attain details upon a click.
                setTimeout(() => {
                    // Iterate through all page autocomplete options.
                    for(let u = 0; u < animeNameUL.children.length; u++) {
                        // Attach the anime name and url for each list item of the autocomplete options.
                        let curChild = animeNameUL.children[u];
                        for(let v = 0; v < response[2].length; v++) {
                            if(curChild.children[0].getAttribute("src") == response[2][v][1]) {
                                curChild.setAttribute("name", response[2][v][0]);
                                curChild.setAttribute("pageurl", response[2][v][2]);
                            }
                        }
                        // Listen for a click event on a page autocomplete option in order to fetch the associated details from myanimelist.
                        curChild.addEventListener("click", eve => {
                            // Make sure that only a single request is made for details to be fetched.
                            if(eve.currentTarget.dataset.triggered) { return; }
                            eve.currentTarget.dataset.triggered = true;
                            // Define the list item which was clicked on.
                            let curItem = eve.target.closest("li");
                            // Update the page anime name in case the name was truncated in the autocomplete list.
                            setTimeout(() => { animeName.value = curItem.getAttribute("name"); }, 10);
                            animePreloader.style.visibility = "visible";
                            // Send a request for the details to be fetched on the back-end.
                            ipcRenderer.send("animeFetchDetails", curItem.getAttribute("pageurl"));
                        }, { "once": true });
                    }
                }, 500);
            }
            // If the anime name is not long enough then update the page autocomplete options to be empty.
            else { animeNameAutocomplete.updateData({}); }
        });
        // // Listen for the "Enter" button press on a page autocomplete option in order to fetch the associated details from myanimelist.
        // document.body.addEventListener("keydown", eve => {
        //     console.log("enter pressed!");
        //     console.log(eve.target);
        //     console.log(eve.key);
        //     console.log(eve);
        //     // if(eve.keyCode == 13) {
        //     //     // Make sure that only a single request is made for details to be fetched.
        //     //     if(eve.currentTarget.dataset.triggered) { return; }
        //     //     eve.currentTarget.dataset.triggered = true;
        //     //     // Define the list item which was clicked on.
        //     //     // let curItem = eve.target.closest("li");
        //     //     // Update the page anime name in case the name was truncated in the autocomplete list.
        //     //     setTimeout(() => { animeName.value = eve.target.getAttribute("name"); }, 10);
        //     //     animePreloader.style.visibility = "visible";
        //     //     // Send a request for the details to be fetched on the back-end.
        //     //     ipcRenderer.send("animeFetchDetails", eve.target.getAttribute("pageurl"));
        //     // }
        // });
        // Update the page accordingly based on the fetched anime details.
        ipcRenderer.on("animeFetchDetailsResult", (newEve, newResponse) => {
            // Update the anime japanese name if available.
            if(newResponse[1] != "") {
                const jnameInput = document.getElementById("animeJapaneseName");
                jnameInput.value = newResponse[1];
                jnameInput.classList.add("valid");
                jnameInput.nextElementSibling.classList.add("active");
            }
            if(newResponse[2] != "") {
                const animeImg = document.getElementById("addRecordAnimeImg");
                animeImg.setAttribute("list", newResponse[2]);
                animeImg.setAttribute("src", newResponse[2]);
            }
            // Update the anime studios if available.
            if(newResponse[8] != "") {
                const studioInput = document.getElementById("animeStudio");
                studioInput.value = newResponse[8];
                studioInput.classList.add("valid");
                studioInput.nextElementSibling.classList.add("active");
            }
            // Update the anime directors if available.
            if(newResponse[9].length > 0) {
                const directorsInput = document.getElementById("animeDirectors");
                directorsInput.value = newResponse[9].join(", ");
                directorsInput.classList.add("valid");
                directorsInput.nextElementSibling.classList.add("active");
            }
            // Update the anime producers if available.
            if(newResponse[10].length > 0) {
                const producersInput = document.getElementById("animeProducers");
                producersInput.value = newResponse[10].join(", ");
                producersInput.classList.add("valid");
                producersInput.nextElementSibling.classList.add("active");
            }
            // Update the anime writers if available.
            if(newResponse[11].length > 0) {
                const writersInput = document.getElementById("animeWriters");
                writersInput.value = newResponse[11].join(", ");
                writersInput.classList.add("valid");
                writersInput.nextElementSibling.classList.add("active");
            }
            // Update the anime musicians if available.
            if(newResponse[12].length > 0) {
                const musicInput = document.getElementById("animeMusicians");
                musicInput.value = newResponse[12].join(", ");
                musicInput.classList.add("valid");
                musicInput.nextElementSibling.classList.add("active");
            }
            // Reset all anime genres to not be checked.
            Array.from(document.querySelectorAll(".genreRow .filled-in")).forEach(inp => inp.checked = false);
            // Iterate through the fetched list of genres and check them off on the page if available.
            newResponse[7].forEach(genreItem => {
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
            animePreloader.style.visibility = "hidden";
        });
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