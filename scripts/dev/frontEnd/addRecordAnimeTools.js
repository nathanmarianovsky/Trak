/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on anime records.

    - animeSaveFunc: Driver function for saving an anime record.
    - animeModalButtons: Listen for click events on the related content anime modal buttons.
    - resetAnimeContentCounters: Resets the page counters for an anime record's related content.
    - calculateAnimeRating: Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.
    - animeListReorganize: Reorganize the list items in the associated anime modal.
    - animeSeasonContentButtons: Listen for change and click events on the related content anime episode table items.
    - animeContentSingleButtons: Listen for click events on the related content anime film/ONA/OVA table items.
    - animeEpisodeAddition: Add an episode to an anime related content season.
    - animeContentSeasonButtons: Listen for click events on the related content anime season table items.
    - animeSingleAddition: Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.
    - animeSeasonAddition: Driver function designed to add a season table item in the related content section of an anime record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Driver function for saving an anime record.

   - auto is a boolean corresponding to whether the save action is a user submission or the application auto saving.

*/
var animeSaveFunc = (auto = false) => {
    // Define the page components which will contain all associated details.
    const animeList = document.getElementById("animeList"),
        animeBookmarkValue = document.getElementById("animeBookmark").children[0].textContent == "check_box",
        animeName = document.getElementById("animeName").value,
        animeJapaneseName = document.getElementById("animeJapaneseName").value,
        animeReview = document.getElementById("animeReview").value,
        animeDirectors = document.getElementById("animeDirectors").value,
        animeProducers = document.getElementById("animeProducers").value,
        animeWriters = document.getElementById("animeWriters").value,
        animeMusicians = document.getElementById("animeMusicians").value,
        animeStudio = document.getElementById("animeStudio").value,
        animeLicense = document.getElementById("animeLicense").value,
        animeSynopsis = document.getElementById("animeSynopsis").value,
        animeImg = document.getElementById("addRecordAnimeImg").getAttribute("list").split(","),
        animeFiles = Array.from(document.getElementById("animeAddRecordFiles").files).map(elem => elem.path),
        otherGenres = document.getElementById("animeOtherGenres").value.split(",").map(elem => elem.trim()),
        genresLst = genreList("Anime"),
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
            if(animeListChildCondition == "AnimeSingle") {
                let singleName = document.getElementById("li_" + q + "_AnimeSingle_Name").value,
                    singleType = document.getElementById("li_" + q + "_AnimeSingle_Type").value,
                    singleRelease = document.getElementById("li_" + q + "_AnimeSingle_Release").value,
                    singleLastWatched = document.getElementById("li_" + q + "_AnimeSingle_LastWatched").value,
                    singleRating = document.getElementById("li_" + q + "_AnimeSingle_Rating").value,
                    singleReview = document.getElementById("li_" + q + "_AnimeSingle_Review").value;
                curContent.push("Single", singleName, singleType, singleRelease, singleLastWatched, singleRating, singleReview);
            }
            // Attain the details on a season and its episodes.
            else if(animeListChildCondition == "AnimeSeason") {
                let seasonName = document.getElementById("li_" + q + "_AnimeSeason_Name").value,
                    seasonStart = document.getElementById("li_" + q + "_AnimeSeason_Start").value,
                    seasonEnd = document.getElementById("li_" + q + "_AnimeSeason_End").value,
                    seasonStatus = document.getElementById("li_" + q + "_AnimeSeason_Status").value,
                    seasonEpisodes = [];
                for(let r = 1; r < animeListChild.children[1].children[0].children.length + 1; r++) {
                    let seasonEpisodeName = document.getElementById("li_" + q + "_AnimeEpisode_Name_" + r).value,
                        seasonEpisodeLastWatched = document.getElementById("li_" + q + "_AnimeEpisode_LastWatched_" + r).value,
                        seasonEpisodeRating = document.getElementById("li_" + q + "_AnimeEpisode_Rating_" + r).value,
                        seasonEpisodeReview = document.getElementById("li_" + q + "_AnimeEpisode_Review_" + r).value;
                    seasonEpisodes.push([seasonEpisodeName, seasonEpisodeLastWatched, seasonEpisodeRating, seasonEpisodeReview]);
                }
                curContent.push("Season", seasonName, seasonStart, seasonEnd, seasonStatus, seasonEpisodes);
            }
            // Push the table item information into the array holding all related content details.
            content.push(curContent);
        }
        const ogName = document.getElementById("animeName").getAttribute("oldName"),
            oldTitle = ogName !== null ? ogName : animeName;
        // Send the request to the back-end portion of the app.
        const submissionMaterial = ["Anime", animeName, animeJapaneseName, animeReview, animeDirectors, animeProducers, animeWriters,
            animeMusicians, animeStudio, animeLicense, animeFiles, [genresLst, genres, otherGenres], content, animeSynopsis,
            [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), animeImg],
            animeBookmarkValue, oldTitle];
        ipcRenderer.send("performSave", [document.getElementById("addRecordsNav").style.display == "none" ? true : false, submissionMaterial, auto]);
        saveAssociations("Anime", animeName, ipcRenderer);
    }
    // If no name has been provided then notify the user.
    else { M.toast({"html": "An anime record requires that either an English or Japanese name is provided.", "classes": "rounded"}); }
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
        clearTooltips();
        animeSingleAddition();
        relatedContentFinisher();
        resetAnimeContentCounters();
    });
    // Listen for a click event on the anime related content season creation button.
    animeAddSeason.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new season.
        clearTooltips();
        animeSeasonAddition();
        relatedContentFinisher();
        resetAnimeContentCounters();
    });
};



/*

Resets the page counters for an anime record's related content.

*/
const resetAnimeContentCounters = () => {
    const itemList = Array.from(document.getElementById("animeList").children),
        animeMovieCount = document.getElementById("animeMovieCount"),
        animeONACount = document.getElementById("animeONACount"),
        animeOVACount = document.getElementById("animeOVACount"),
        animeSpecialCount = document.getElementById("animeSpecialCount"),
        animeSeasonCount = document.getElementById("animeSeasonCount"),
        animeEpisodeCount = document.getElementById("animeEpisodeCount");
    let movieCount = 0, onaCount = 0, ovaCount = 0, specialCount = 0, unclassifiedCount = 0, seasonCount = 0, episodeCount = 0;
    for(let w = 0; w < itemList.length; w++) {
        let scenario = itemList[w].getAttribute("id").split("_")[2];
        if(scenario == "AnimeSingle") {
            let curType = itemList[w].children[0].children[1].children[0].children[0].value;
            if(curType == "Movie") {
                movieCount++;
            }
            else if(curType == "ONA") {
                onaCount++;
            }
            else if(curType == "OVA") {
                ovaCount++;
            }
            else if(curType == "Special") {
                specialCount++;
            }
        }
        else if(scenario == "AnimeSeason") {
            seasonCount++;
            episodeCount += itemList[w].children[1].children[0].children.length;
        }
    }
    counterAssignment(animeMovieCount, movieCount);
    counterAssignment(animeONACount, onaCount);
    counterAssignment(animeOVACount, ovaCount);
    counterAssignment(animeSpecialCount, specialCount);
    counterAssignment(animeSeasonCount, seasonCount);
    counterAssignment(animeEpisodeCount, episodeCount);
};



/*

Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.

*/
const calculateAnimeRating = () => {
    // Define the related content list and global ratings input.
    const relevantList = document.getElementById("animeList"),
        globalRating = document.getElementById("animeRating");
    // Initialize the overall sum and count of items utilized in the sum.
    let sum = 0, count = 0;
    // Iterate through all related content items.
    for(let k = 0; k < relevantList.children.length; k++) {
        let itemType = relevantList.children[k].id.split("_")[2];
        // Pick out the required input based on whether the item is of a type single or season.
        if(itemType == "AnimeSingle") {
            let singleValue = relevantList.children[k].children[0].children[4].children[0].children[3].value;
            if(singleValue != "") {
                sum += parseInt(singleValue);
                count++;
            }
        }
        else if(itemType == "AnimeSeason") {
            let seasonValue = relevantList.children[k].children[0].children[4].children[0].value;
            if(seasonValue != "N/A") {
                sum += parseFloat(seasonValue);
                count++;
            }
        }
    }
    // Update the page global rating input accordingly.
    count == 0 ? globalRating.value = "N/A" : globalRating.value = (sum / count).toFixed(2);
};



/*

Reorganize the list items in the associated anime modal.

*/
var animeListReorganize = () => {
    // Define the related content list.
    const animeModalList = document.getElementById("animeList");
    // Iterate through all related content items.
    for(let i = 1; i < animeModalList.children.length + 1; i++) {
        // Define the associated components to the related content item.
        let child = animeModalList.children[i - 1],
            currentNum = child.id.split("_")[1],
            childType = child.id.split("_")[2],
            childHeader = child.children[0],
            childBody = child.children[1];
        // If the item is of type single then change the id and for attributes accordingly.
        if(childType == "AnimeSingle" && parseInt(currentNum) != i) {
            let singleNameInput = childHeader.children[0].children[0],
                singleNameLabel = childHeader.children[0].children[1],
                singleTypeSelect = childHeader.children[1].children[0].children[3],
                singleReleaseInput = childHeader.children[2].children[0],
                singleReleaseLabel = childHeader.children[2].children[1],
                singleLastWatchedInput = childHeader.children[3].children[0],
                singleLastWatchedLabel = childHeader.children[3].children[1],
                singleRatingSelect = childHeader.children[4].children[0].children[3],
                singleReviewInput = childBody.children[0].children[0].children[0].children[0],
                singleReviewLabel = childBody.children[0].children[0].children[0].children[1];
            child.setAttribute("id", "li_" + i + "_AnimeSingle");
            singleNameInput.setAttribute("id", "li_" + i + "_AnimeSingle_Name");
            singleNameLabel.setAttribute("for", "li_" + i + "_AnimeSingle_Name");
            singleTypeSelect.setAttribute("id", "li_" + i + "_AnimeSingle_Type");
            singleReleaseInput.setAttribute("id", "li_" + i + "_AnimeSingle_Release");
            singleReleaseLabel.setAttribute("for", "li_" + i + "_AnimeSingle_Release");
            singleLastWatchedInput.setAttribute("id", "li_" + i + "_AnimeSingle_LastWatched");
            singleLastWatchedLabel.setAttribute("for", "li_" + i + "_AnimeSingle_LastWatched");
            singleRatingSelect.setAttribute("id", "li_" + i + "_AnimeSingle_Rating");
            singleReviewInput.setAttribute("id", "li_" + i + "_AnimeSingle_Review");
            singleReviewLabel.setAttribute("for", "li_" + i + "_AnimeSingle_Review");
        }
        // If the item is of type season then change the id and for attributes accordingly.
        else if(childType == "AnimeSeason") {
            let seasonNameInput = childHeader.children[0].children[0],
                seasonNameLabel = childHeader.children[0].children[1],
                seasonStartInput = childHeader.children[1].children[0],
                seasonStartLabel = childHeader.children[1].children[1],
                seasonEndInput = childHeader.children[2].children[0],
                seasonEndLabel = childHeader.children[2].children[1],
                seasonStatusSelect = childHeader.children[3].children[0].children[3],
                seasonAverageRatingInput = childHeader.children[4].children[0],
                seasonAverageRatingLabel = childHeader.children[4].children[1];
            child.setAttribute("id", "li_" + i + "_AnimeSeason");
            seasonNameInput.setAttribute("id", "li_" + i + "_AnimeSeason_Name");
            seasonNameLabel.setAttribute("for", "li_" + i + "_AnimeSeason_Name");
            seasonStartInput.setAttribute("id", "li_" + i + "_AnimeSeason_Start");
            seasonStartLabel.setAttribute("for", "li_" + i + "_AnimeSeason_Start");
            seasonEndInput.setAttribute("id", "li_" + i + "_AnimeSeason_End");
            seasonEndLabel.setAttribute("for", "li_" + i + "_AnimeSeason_End");
            seasonStatusSelect.setAttribute("id", "li_" + i + "_AnimeSeason_Status");
            seasonAverageRatingInput.setAttribute("id", "li_" + i + "_AnimeSeason_AverageRating");
            seasonAverageRatingLabel.setAttribute("for", "li_" + i + "_AnimeSeason_AverageRating");
            // Iterate through the season episodes and change the id and for attributes accordingly.
            for(let j = 1; j < childBody.children[0].children.length + 1; j++) {
                let episodeChild = childBody.children[0].children[j - 1],
                    episodeChildNameInput = episodeChild.children[0].children[0],
                    episodeChildNameLabel = episodeChild.children[0].children[1],
                    episodeChildLastWatchedInput = episodeChild.children[1].children[0],
                    episodeChildLastWatchedLabel = episodeChild.children[1].children[1],
                    episodeChildRatingSelect = episodeChild.children[2].children[0].children[3],
                    episodeChildReviewInput = episodeChild.children[3].children[0],
                    episodeChildReviewLabel = episodeChild.children[3].children[1];
                episodeChildNameInput.setAttribute("id", "li_" + i + "_AnimeEpisode_Name_" + j);
                episodeChildNameLabel.setAttribute("for", "li_" + i + "_AnimeEpisode_Name_" + j);
                episodeChildLastWatchedInput.setAttribute("id", "li_" + i + "_AnimeEpisode_LastWatched_" + j);
                episodeChildLastWatchedLabel.setAttribute("for", "li_" + i + "_AnimeEpisode_LastWatched_" + j);
                episodeChildRatingSelect.setAttribute("id", "li_" + i + "_AnimeEpisode_Rating_" + j);
                episodeChildReviewInput.setAttribute("id", "li_" + i + "_AnimeEpisode_Review_" + j);
                episodeChildReviewLabel.setAttribute("for", "li_" + i + "_AnimeEpisode_Review_" + j);
            }
        }
    }
};



/*

Listen for change and click events on the related content anime episode table items.

    - ratingSelect is the input corresponding to the episode rating.
    - delButton is the button that deletes an episode.

*/
const animeSeasonContentButtons = (ratingSelect, delButton) => {
    // Listen for a change in the rating of an anime episode.
    ratingSelect.addEventListener("change", e => {
        // Calculate the new average of the anime season rating based on the ratings of the episodes.
        let selectIdArr = e.target.id.split("_"),
            seasonNum = selectIdArr[1],
            episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_AnimeEpisode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
            avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
        // Write the new rating average to the page.
        document.getElementById("li_" + seasonNum + "_AnimeSeason_AverageRating").value = avg.toFixed(2);
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
    // Listen for a click on the delete button of an anime season episode.
    delButton.addEventListener("click", e => {
        let selectIdArr = e.target.parentNode.parentNode.parentNode.children[0].children[0].id.split("_"),
            seasonNum = selectIdArr[1],
            delTarget = e.target.parentNode.parentNode.parentNode;
        // Remove the tooltips.
        clearTooltips();
        // Remove the deleted episode.
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate the new average of the anime season rating based on the ratings of the episodes.
        let episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_AnimeEpisode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != "");
        // If the list of ratings available has at least one entry then define the average properly.
        if(episodesArrFiltered.length > 0) {
            let avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_AnimeSeason_AverageRating").value = avg.toFixed(2);
        }
        // If there are no ratings available then set the season ratings average to the default value.
        else {
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_AnimeSeason_AverageRating").value = "N/A";
        }
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
        // Reset the record page counters.
        resetAnimeContentCounters();
    });
};



/*

Listen for click events on the related content anime film/ONA/OVA table items.

    - formSingleName is the input corresponding to the film/ONA/OVA name.
    - formSingleReleaseDate is the input corresponding to the film/ONA/OVA release date.
    - formSingleLastWatchedDate is the input corresponding to the film/ONA/OVA last watched date.
    - formSingleRating is the input corresponding to the film/ONA/OVA rating.
    - delSingleBtn is the button that deletes a film/ONA/OVA.
    - formSingleType is the input corresponding to the film/ONA/OVA type.

*/
const animeContentSingleButtons = (formSingleName, formSingleReleaseDate, formSingleLastWatchedDate, formSingleRating, delSingleBtn, formSingleType) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formSingleName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleReleaseDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleLastWatchedDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a change event on the single type for a film/ONA/OVA on the anime related modal to reset the page counters.
    formSingleType.addEventListener("change", e =>  setTimeout(() => resetAnimeContentCounters(), 10));
    // Listen for a click event on the delete button for a film/ONA/OVA on the anime related modal to delete the season.
    delSingleBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
        // Reset the record page counters.
        resetAnimeContentCounters();
    });
    // Listen for a change in the rating of a film/ONA/OVA.
    formSingleRating.addEventListener("change", e => {
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
};



/*

Add an episode to an anime related content season.

    - tgt is the document element corresponding to the season table item.

*/
const animeEpisodeAddition = tgt => {
    // Remove the tooltips.
    clearTooltips();
    // Define the list item id.
    const addTargetNum = tgt.id.split("_")[1];
    tgt.classList.remove("active");
    // Define and construct all components needed to attach an anime season episode to the related content table.
    const rowDiv = document.createElement("div"),
        seasonEpisodeNameDiv = document.createElement("span"),
        seasonEpisodeNameLabel = document.createElement("label"),
        seasonEpisodeNameInput = document.createElement("input"),
        seasonEpisodeLastWatchedDiv = document.createElement("div"),
        seasonEpisodeLastWatchedInput = document.createElement("input"),
        seasonEpisodeLastWatchedLabel = document.createElement("label"),
        seasonEpisodeRatingDiv = document.createElement("div"),
        seasonEpisodeRatingSelect = document.createElement("select"),
        seasonEpisodeRatingLabel = document.createElement("label"),
        seasonEpisodeRatingDefOption = document.createElement("option"),
        seasonEpisodeReviewDiv = document.createElement("span"),
        seasonEpisodeReviewLabel = document.createElement("label"),
        seasonEpisodeReviewInput = document.createElement("textarea"),
        seasonEpisodeDeleteDiv = document.createElement("div"),
        seasonEpisodeDeleteSpan = document.createElement("span"),
        seasonEpisodeDeleteIcon = document.createElement("i");
    // Prepare the season episode name.
    seasonEpisodeNameInput.setAttribute("type", "text");
    seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_AnimeEpisode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameInput.classList.add("validate", "left");
    seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_AnimeEpisode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameLabel.textContent = "Episode Name:";
    seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode last watched date.
    seasonEpisodeLastWatchedInput.classList.add("validate", "left");
    seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_AnimeEpisode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedInput.setAttribute("type", "date");
    seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_AnimeEpisode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
    seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode rating.
    seasonEpisodeRatingDefOption.setAttribute("value", "");
    seasonEpisodeRatingDefOption.setAttribute("selected", "true");
    seasonEpisodeRatingDefOption.textContent = "N/A";
    seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_AnimeEpisode_Rating_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeRatingSelect.append(seasonEpisodeRatingDefOption);
    for(let t = 0; t < 11; t++) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", t);
        newOption.textContent = t + "/10";
        seasonEpisodeRatingSelect.append(newOption);
    }
    seasonEpisodeRatingLabel.textContent = "Rating:";
    seasonEpisodeRatingDiv.classList.add("input-field", "col", "s2", "selectShortVerticalScroll");
    // Prepare the season episode review.
    seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_AnimeEpisode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
    seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_AnimeEpisode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewLabel.textContent = "Comments/Review:";
    seasonEpisodeReviewDiv.classList.add("input-field", "col", "s5");
    // Prepare the season episode button for deleting the episode.
    seasonEpisodeDeleteDiv.classList.add("input-field", "col", "s1", "modalContentEpisodeDelete");
    seasonEpisodeDeleteSpan.classList.add("center", "tooltipped");
    seasonEpisodeDeleteSpan.setAttribute("data-position", "top");
    seasonEpisodeDeleteSpan.setAttribute("data-tooltip", "Delete");
    seasonEpisodeDeleteSpan.classList.add("modalContentDelete");
    seasonEpisodeDeleteIcon.textContent = "delete";
    seasonEpisodeDeleteIcon.classList.add("material-icons", "modalContentEpisodeDeleteIcon");
    // Attach all season episodes components to the form item.
    rowDiv.classList.add("row");
    seasonEpisodeNameDiv.append(seasonEpisodeNameInput, seasonEpisodeNameLabel);
    seasonEpisodeLastWatchedDiv.append(seasonEpisodeLastWatchedInput, seasonEpisodeLastWatchedLabel);
    seasonEpisodeRatingDiv.append(seasonEpisodeRatingSelect, seasonEpisodeRatingLabel);
    seasonEpisodeReviewDiv.append(seasonEpisodeReviewInput, seasonEpisodeReviewLabel);
    seasonEpisodeDeleteSpan.append(seasonEpisodeDeleteIcon);
    seasonEpisodeDeleteDiv.append(seasonEpisodeDeleteSpan);
    rowDiv.append(seasonEpisodeNameDiv, seasonEpisodeLastWatchedDiv, seasonEpisodeRatingDiv, seasonEpisodeReviewDiv, seasonEpisodeDeleteDiv);
    // Attach the form item to the page modal.
    tgt.children[1].children[0].append(rowDiv);
    // Initialize the select tags.
    initSelect();
    // Initialize the tooltips.
    initTooltips();
    // Initialize the observers for all relevant select tags.
    initSelectObservers();
    // Add the button listeners associated to an anime season episode.
    animeSeasonContentButtons(seasonEpisodeRatingSelect, seasonEpisodeDeleteIcon);
};



/*

Listen for click events on the related content anime season table items.

    - formName is the input corresponding to the season name.
    - formStartDate is the input corresponding to the season start date.
    - formEndDate is the input corresponding to the season end date.
    - formAverageRating is the input corresponding to the season average rating.
    - addBtn is the button that adds a season episode.
    - delBtn is the button that deletes a season.

*/
const animeContentSeasonButtons = (formName, formStartDate, formEndDate, formAverageRating, addBtn, delBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formStartDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formEndDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formAverageRating.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a season on the anime associated modal to delete the season.
    delBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        animeListReorganize();
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
        // Reset the record page counters.
        resetAnimeContentCounters();
    });
    // Listen for a click event on the add button for a season on the anime associated modal to add an episode listing.
    addBtn.addEventListener("click", e => {
        // Add an episode to the associated anime.
        animeEpisodeAddition(e.target.parentNode.parentNode.parentNode.parentNode);
        // Reset the record page counters.
        resetAnimeContentCounters();
    });
};



/*

Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.

*/
const animeSingleAddition = () => {
    // Define and construct all components needed to attach an anime film to the related content table.
    const animeList = document.getElementById("animeList"),
        itemSingleLI = document.createElement("li"),
        itemSingleDivHeader = document.createElement("div"),
        divSingleName = document.createElement("div"),
        inputSingleName = document.createElement("input"),
        labelSingleName = document.createElement("label"),
        divSingleType = document.createElement("div"),
        selectSingleType = document.createElement("select"),
        option1SingleType = document.createElement("option"),
        option2SingleType = document.createElement("option"),
        option3SingleType = document.createElement("option"),
        option4SingleType = document.createElement("option"),
        option5SingleType = document.createElement("option"),
        labelSingleType = document.createElement("label"),
        divSingleReleaseDate = document.createElement("div"),
        inputSingleReleaseDate = document.createElement("input"),
        labelSingleReleaseDate = document.createElement("label"),
        divSingleLastWatchedDate = document.createElement("div"),
        inputSingleLastWatchedDate = document.createElement("input"),
        labelSingleLastWatchedDate = document.createElement("label"),
        divSingleRating = document.createElement("div"),
        selectSingleRating = document.createElement("select"),
        labelSingleRating = document.createElement("label"),
        defOptionSingleRating = document.createElement("option"),
        divSingleDelete = document.createElement("div"),
        spanSingleDelete = document.createElement("span"),
        iconSingleDelete = document.createElement("i"),
        itemSingleDivBody = document.createElement("div"),
        itemSingleDivBodyForm = document.createElement("form"),
        divSingleReview = document.createElement("div"),
        spanSingleReview = document.createElement("span"),
        inputSingleReview = document.createElement("textarea"),
        labelSingleReview = document.createElement("label");
    // Prepare the film/ONA/OVA name.
    divSingleName.classList.add("input-field");
    divSingleName.style.width = "20%";
    inputSingleName.classList.add("validate", "left");
    inputSingleName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Name");
    inputSingleName.setAttribute("type", "text");
    labelSingleName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Name");
    labelSingleName.textContent = "Name:";
    // Prepare the single type.
    divSingleType.classList.add("input-field");
    divSingleType.style.width = "17.5%";
    divSingleType.style.marginLeft = "25px";
    option1SingleType.setAttribute("value", "");
    option1SingleType.textContent = "N/A";
    option2SingleType.setAttribute("value", "Movie");
    option2SingleType.textContent = "Movie";
    option3SingleType.setAttribute("value", "ONA");
    option3SingleType.textContent = "ONA";
    option4SingleType.setAttribute("value", "OVA");
    option4SingleType.textContent = "OVA";
    option5SingleType.setAttribute("value", "Special");
    option5SingleType.textContent = "Special";
    selectSingleType.append(option1SingleType, option2SingleType, option3SingleType, option4SingleType, option5SingleType);
    selectSingleType.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Type");
    labelSingleType.textContent = "Type:";
    // Prepare the film/ONA/OVA release date.
    divSingleReleaseDate.classList.add("input-field");
    divSingleReleaseDate.style.width = "20%";
    divSingleReleaseDate.style.marginLeft = "25px";
    inputSingleReleaseDate.classList.add("validate", "left");
    inputSingleReleaseDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Release");
    inputSingleReleaseDate.setAttribute("type", "date");
    labelSingleReleaseDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Release");
    labelSingleReleaseDate.textContent = "Release Date:";
    // Prepare the film/ONA/OVA last watched date.
    divSingleLastWatchedDate.classList.add("input-field");
    divSingleLastWatchedDate.style.width = "20%";
    divSingleLastWatchedDate.style.marginLeft = "25px";
    inputSingleLastWatchedDate.classList.add("validate", "left");
    inputSingleLastWatchedDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_LastWatched");
    inputSingleLastWatchedDate.setAttribute("type", "date");
    labelSingleLastWatchedDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSingle_LastWatched");
    labelSingleLastWatchedDate.textContent = "Last Watched Date:";
    // Prepare the film/ONA/OVA rating.
    divSingleRating.classList.add("input-field", "selectShortVerticalScroll");
    divSingleRating.style.width = "17.5%";
    divSingleRating.style.marginLeft = "25px";
    defOptionSingleRating.setAttribute("value", "");
    defOptionSingleRating.setAttribute("selected", "true");
    defOptionSingleRating.textContent = "N/A";
    selectSingleRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Rating");
    selectSingleRating.append(defOptionSingleRating);
    for(let t = 0; t < 11; t++) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", t);
        newOption.textContent = t + "/10";
        selectSingleRating.append(newOption);
    }
    labelSingleRating.textContent = "Rating:";
    // Prepare the film/ONA/OVA button for deleting the item.
    divSingleDelete.classList.add("input-field");
    divSingleDelete.style.width = "5%";
    divSingleDelete.style.marginLeft = "25px";
    spanSingleDelete.classList.add("center", "tooltipped");
    spanSingleDelete.setAttribute("data-position", "top");
    spanSingleDelete.setAttribute("data-tooltip", "Delete");
    spanSingleDelete.classList.add("modalContentButtons", "modalContentDelete");
    iconSingleDelete.textContent = "delete_sweep";
    iconSingleDelete.classList.add("material-icons");
    // Prepare the film/ONA/OVA review.
    divSingleReview.classList.add("row");
    spanSingleReview.classList.add("input-field", "col", "s12");
    inputSingleReview.classList.add("validate", "materialize-textarea");
    inputSingleReview.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Review");
    labelSingleReview.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSingle_Review");
    labelSingleReview.textContent = "Comments/Review:";
    // Attach all season components to the list item.
    itemSingleDivHeader.classList.add("collapsible-header");
    itemSingleDivBody.classList.add("collapsible-body");
    divSingleName.append(inputSingleName, labelSingleName);
    divSingleType.append(selectSingleType, labelSingleType);
    divSingleReleaseDate.append(inputSingleReleaseDate, labelSingleReleaseDate);
    divSingleLastWatchedDate.append(inputSingleLastWatchedDate, labelSingleLastWatchedDate);
    divSingleRating.append(selectSingleRating, labelSingleRating);
    spanSingleReview.append(inputSingleReview, labelSingleReview);
    divSingleReview.append(spanSingleReview);
    spanSingleDelete.append(iconSingleDelete);
    divSingleDelete.append(spanSingleDelete);
    itemSingleDivHeader.append(divSingleName, divSingleType, divSingleReleaseDate, divSingleLastWatchedDate, divSingleRating, divSingleDelete);
    // Attach the div designed to house the film/ONA/OVA review.
    itemSingleDivBodyForm.classList.add("col", "s12");
    itemSingleDivBodyForm.append(divSingleReview);
    itemSingleDivBody.append(itemSingleDivBodyForm);
    // Attach the list item to the page modal.
    itemSingleLI.setAttribute("draggable", "true");
    itemSingleLI.classList.add("dropzone");
    itemSingleLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSingle");
    itemSingleLI.append(itemSingleDivHeader, itemSingleDivBody);
    animeList.append(itemSingleLI);
    // Add the button listeners associated to a film/ONA/OVA.
    animeContentSingleButtons(inputSingleName, inputSingleReleaseDate, inputSingleLastWatchedDate, selectSingleRating, iconSingleDelete, selectSingleType);
};



/*

Driver function designed to add a season table item in the related content section of an anime record.

*/
const animeSeasonAddition = () => {
    // Define and construct all components needed to attach an anime season to the related content table.
    const animeList = document.getElementById("animeList"),
        itemLI = document.createElement("li"),
        itemDivHeader = document.createElement("div"),
        divName = document.createElement("div"),
        inputName = document.createElement("input"),
        labelName = document.createElement("label"),
        divStartDate = document.createElement("div"),
        inputStartDate = document.createElement("input"),
        labelStartDate = document.createElement("label"),
        divEndDate = document.createElement("div"),
        inputEndDate = document.createElement("input"),
        labelEndDate = document.createElement("label"),
        divStatus = document.createElement("div"),
        selectStatus = document.createElement("select"),
        option1Status = document.createElement("option"),
        option2Status = document.createElement("option"),
        option3Status = document.createElement("option"),
        option4Status = document.createElement("option"),
        option5Status = document.createElement("option"),
        option6Status = document.createElement("option"),
        labelStatus = document.createElement("label"),
        divAverageRating = document.createElement("div"),
        inputAverageRating = document.createElement("input"),
        labelAverageRating = document.createElement("label"),
        divAdd = document.createElement("div"),
        spanAdd = document.createElement("span"),
        iconAdd = document.createElement("i"),
        divDelete = document.createElement("div"),
        spanDelete = document.createElement("span"),
        iconDelete = document.createElement("i"),
        itemDivBody = document.createElement("div"),
        itemDivBodyForm = document.createElement("form");
    // Prepare the season name.
    divName.classList.add("input-field");
    divName.style.width = "17%";
    inputName.classList.add("validate", "left");
    inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_Name");
    inputName.setAttribute("type", "text");
    labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSeason_Name");
    labelName.textContent = "Season Name:";
    // Prepare the season start date.
    divStartDate.classList.add("input-field");
    divStartDate.style.width = "15%";
    divStartDate.style.marginLeft = "25px";
    inputStartDate.classList.add("validate", "left");
    inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_Start");
    inputStartDate.setAttribute("type", "date");
    labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSeason_Start");
    labelStartDate.textContent = "Season Start Date:";
    // Prepare the season end date.
    divEndDate.classList.add("input-field");
    divEndDate.style.width = "15%";
    divEndDate.style.marginLeft = "25px";
    inputEndDate.classList.add("validate", "left");
    inputEndDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_End");
    inputEndDate.setAttribute("type", "date");
    labelEndDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSeason_End");
    labelEndDate.textContent = "Season End Date:";
    // Prepare the season status.
    divStatus.classList.add("input-field");
    divStatus.style.width = "15%";
    divStatus.style.marginLeft = "25px";
    option1Status.setAttribute("value", "");
    option1Status.textContent = "N/A";
    option2Status.setAttribute("value", "Watching");
    option2Status.textContent = "Watching";
    option3Status.setAttribute("value", "Completed");
    option3Status.textContent = "Completed";
    option4Status.setAttribute("value", "On-Hold");
    option4Status.textContent = "On-Hold";
    option5Status.setAttribute("value", "Dropped");
    option5Status.textContent = "Dropped";
    option6Status.setAttribute("value", "Plan To Watch");
    option6Status.textContent = "Plan To Watch";
    selectStatus.append(option1Status, option2Status, option3Status, option4Status, option5Status, option6Status);
    selectStatus.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_Status");
    labelStatus.textContent = "Status:";
    // Prepare the season average rating.
    divAverageRating.classList.add("input-field");
    divAverageRating.style.width = "13%";
    divAverageRating.style.marginLeft = "25px";
    inputAverageRating.classList.add("left");
    inputAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_AverageRating");
    inputAverageRating.setAttribute("type", "text");
    inputAverageRating.readOnly = "true";
    inputAverageRating.value = "N/A";
    labelAverageRating.classList.add("active");
    labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_AnimeSeason_AverageRating");
    labelAverageRating.textContent = "Average Rating:";
    // Prepare the season button for adding an episode.
    divAdd.classList.add("input-field");
    divAdd.style.width = "5%";
    divAdd.style.marginLeft = "25px";
    spanAdd.classList.add("center", "tooltipped");
    spanAdd.setAttribute("data-position", "top");
    spanAdd.setAttribute("data-tooltip", "+ Episode");
    spanAdd.classList.add("modalContentButtons", "modalContentAdd");
    iconAdd.textContent = "add";
    iconAdd.classList.add("material-icons");
    iconAdd.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason_AddEpisode");
    // Prepare the season button for deleting the season.
    divDelete.classList.add("input-field");
    divDelete.style.width = "5%";
    divDelete.style.marginLeft = "25px";
    spanDelete.classList.add("center", "tooltipped");
    spanDelete.setAttribute("data-position", "top");
    spanDelete.setAttribute("data-tooltip", "Delete");
    spanDelete.classList.add("modalContentButtons", "modalContentDelete");
    iconDelete.textContent = "delete_sweep";
    iconDelete.classList.add("material-icons");
    // Attach all season components to the list item.
    itemDivHeader.classList.add("collapsible-header");
    itemDivBody.classList.add("collapsible-body");
    divName.append(inputName, labelName);
    divStartDate.append(inputStartDate, labelStartDate);
    divEndDate.append(inputEndDate, labelEndDate);
    divAverageRating.append(inputAverageRating, labelAverageRating);
    spanAdd.append(iconAdd);
    divAdd.append(spanAdd);
    spanDelete.append(iconDelete);
    divDelete.append(spanDelete);
    divStatus.append(selectStatus, labelStatus);
    itemDivHeader.append(divName, divStartDate, divEndDate, divStatus, divAverageRating, divAdd, divDelete);
    // Attach the div designed to house all season episodes.
    itemDivBodyForm.classList.add("col", "s12");
    itemDivBody.append(itemDivBodyForm);
    // Attach the list item to the page modal.
    itemLI.setAttribute("draggable", "true");
    itemLI.classList.add("dropzone");
    itemLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_AnimeSeason");
    itemLI.append(itemDivHeader, itemDivBody);
    animeList.append(itemLI);
    // Add the button listeners associated to an anime season.
    animeContentSeasonButtons(inputName, inputStartDate, inputEndDate, inputAverageRating, iconAdd, iconDelete);
};