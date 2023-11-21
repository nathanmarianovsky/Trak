/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page.

    - resetAnimeContentCounters: Resets the page counters for an anime record's related content.
    - resetMangaContentCounters: Resets the page counters for a manga record's related content.
    - calculateAnimeRating: Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.
    - calculateMangaRating: Calculates the average rating for a manga based on the available ratings for all chapters and volumes.
    - animeListReorganize: Reorganize the list items in the associated anime modal.
    - mangaListReorganize: Reorganize the list items in the associated manga modal.
    - animeSeasonContentButtons: Listen for change and click events on the related content anime episode table items.
    - animeContentSingleButtons: Listen for click events on the related content anime film/ONA/OVA table items.
    - mangaContentSingleButtons: Listen for click events on the related content manga chapter/volume table items.
    - episodeAddition: Add an episode to an anime related content season.
    - animeContentSeasonButtons: Listen for click events on the related content anime season table items.
    - singleAddition: Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.
    - seasonAddition: Driver function designed to add a season table item in the related content section of an anime record.
    - mangaItemAddition: Driver function designed to add a chapter/volume table item in the related content section of a manga record.
    - relatedContentFinisher: Initializes select tags and tooltips. Designed to be executed after all related content items have been added.
    - relatedContentListeners: Addes the appropriate event listeners to ensure that page items are highlighted only in the event that a change in the original value is detected.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Resets the page counters for an anime record's related content.

*/
var resetAnimeContentCounters = () => {
    const itemList = Array.from(document.getElementById("animeList").children);
    let movieCount = 0, onaCount = 0, ovaCount = 0, specialCount = 0, unclassifiedCount = 0, seasonCount = 0, episodeCount = 0;
    for(let w = 0; w < itemList.length; w++) {
        let scenario = itemList[w].getAttribute("id").split("_")[2];
        if(scenario == "Single") {
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
        else if(scenario == "Season") {
            seasonCount++;
            episodeCount += itemList[w].children[1].children[0].children.length;
        }
    }
    document.getElementById("animeMovieCount").value = movieCount;
    document.getElementById("animeONACount").value = onaCount;
    document.getElementById("animeOVACount").value = ovaCount;
    document.getElementById("animeSpecialCount").value = specialCount;
    document.getElementById("animeSeasonCount").value = seasonCount;
    document.getElementById("animeEpisodeCount").value = episodeCount;
};



/*

Resets the page counters for a manga record's related content.

*/
var resetMangaContentCounters = () => {
    const itemList = Array.from(document.getElementById("mangaList").children);
    let chapterCount = 0, volumeCount = 0;
    for(let w = 0; w < itemList.length; w++) {
        let scenario = itemList[w].getAttribute("id").split("_")[2];
        if(scenario == "Chapter") {
            chapterCount++;
        }
        else if(scenario == "Volume") {
            volumeCount++;
        }
    }
    document.getElementById("mangaChapterCount").value = chapterCount;
    document.getElementById("mangaVolumeCount").value = volumeCount;
};



/*

Calculates the average rating for an anime based on the available ratings for all films, ONAs, OVAs, and seasons.

*/
var calculateAnimeRating = () => {
    // Define the related content list and global ratings input.
    const relevantList = document.getElementById("animeList"),
        globalRating = document.getElementById("animeRating");
    // Initialize the overall sum and count of items utilized in the sum.
    let sum = 0, count = 0;
    // Iterate through all related content items.
    for(let k = 0; k < relevantList.children.length; k++) {
        let itemType = relevantList.children[k].id.split("_")[2];
        // Pick out the required input based on whether the item is of a type single or season.
        if(itemType == "Single") {
            let singleValue = relevantList.children[k].children[0].children[4].children[0].children[3].value;
            if(singleValue != "") {
                sum += parseInt(singleValue);
                count++;
            }
        }
        else if(itemType == "Season") {
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

Calculates the average rating for a manga based on the available ratings for all chapters and volumes.

*/
var calculateMangaRating = () => {
    // Define the related content list and global ratings input.
    const relevantList = document.getElementById("mangaList"),
        globalRating = document.getElementById("mangaRating");
    // Initialize the overall sum and count of items utilized in the sum.
    let chapterSum = 0, volumeSum = 0, chapterCount = 0, volumeCount = 0, singleValue = "";
    // Iterate through all related content items.
    for(let k = 0; k < relevantList.children.length; k++) {
        let itemType = relevantList.children[k].id.split("_")[2];
        // Pick out the required input based on whether the item is of a type chapter or volume.
        itemType == "Volume" ? singleValue = relevantList.children[k].children[0].children[4].children[0].children[3].value : singleValue = relevantList.children[k].children[0].children[3].children[0].children[3].value;
        if(itemType == "Chapter" && singleValue != "") {
            chapterSum += parseInt(singleValue);
            chapterCount++;
        }
        else if(itemType == "Volume" && singleValue != "") {
            volumeSum += parseInt(singleValue);
            volumeCount++;
        }
    }
    // Update the page global rating input accordingly.
    chapterCount + volumeCount == 0 ? globalRating.value = "N/A"
        : globalRating.value = (((chapterCount == 0 ? 0 : (chapterSum / chapterCount)) + (volumeCount == 0 ? 0 : (volumeSum / volumeCount))) / (chapterCount != 0 && volumeCount != 0 ? 2 : 1)).toFixed(2);
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
        if(childType == "Single" && parseInt(currentNum) != i) {
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
            child.setAttribute("id", "li_" + i + "_Single");
            singleNameInput.setAttribute("id", "li_" + i + "_Single_Name");
            singleNameLabel.setAttribute("for", "li_" + i + "_Single_Name");
            singleTypeSelect.setAttribute("id", "li_" + i + "_Single_Type");
            singleReleaseInput.setAttribute("id", "li_" + i + "_Single_Release");
            singleReleaseLabel.setAttribute("for", "li_" + i + "_Single_Release");
            singleLastWatchedInput.setAttribute("id", "li_" + i + "_Single_LastWatched");
            singleLastWatchedLabel.setAttribute("for", "li_" + i + "_Single_LastWatched");
            singleRatingSelect.setAttribute("id", "li_" + i + "_Single_Rating");
            singleReviewInput.setAttribute("id", "li_" + i + "_Single_Review");
            singleReviewLabel.setAttribute("for", "li_" + i + "_Single_Review");
        }
        // If the item is of type season then change the id and for attributes accordingly.
        else if(childType == "Season") {
            let seasonNameInput = childHeader.children[0].children[0],
                seasonNameLabel = childHeader.children[0].children[1],
                seasonStartInput = childHeader.children[1].children[0],
                seasonStartLabel = childHeader.children[1].children[1],
                seasonEndInput = childHeader.children[2].children[0],
                seasonEndLabel = childHeader.children[2].children[1],
                seasonStatusSelect = childHeader.children[3].children[0].children[3],
                seasonAverageRatingInput = childHeader.children[4].children[0],
                seasonAverageRatingLabel = childHeader.children[4].children[1];
            child.setAttribute("id", "li_" + i + "_Season");
            seasonNameInput.setAttribute("id", "li_" + i + "_Season_Name");
            seasonNameLabel.setAttribute("for", "li_" + i + "_Season_Name");
            seasonStartInput.setAttribute("id", "li_" + i + "_Season_Start");
            seasonStartLabel.setAttribute("for", "li_" + i + "_Season_Start");
            seasonEndInput.setAttribute("id", "li_" + i + "_Season_End");
            seasonEndLabel.setAttribute("for", "li_" + i + "_Season_End");
            seasonStatusSelect.setAttribute("id", "li_" + i + "_Season_Status");
            seasonAverageRatingInput.setAttribute("id", "li_" + i + "_Season_AverageRating");
            seasonAverageRatingLabel.setAttribute("for", "li_" + i + "_Season_AverageRating");
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
                episodeChildNameInput.setAttribute("id", "li_" + i + "_Episode_Name_" + j);
                episodeChildNameLabel.setAttribute("for", "li_" + i + "_Episode_Name_" + j);
                episodeChildLastWatchedInput.setAttribute("id", "li_" + i + "_Episode_LastWatched_" + j);
                episodeChildLastWatchedLabel.setAttribute("for", "li_" + i + "_Episode_LastWatched_" + j);
                episodeChildRatingSelect.setAttribute("id", "li_" + i + "_Episode_Rating_" + j);
                episodeChildReviewInput.setAttribute("id", "li_" + i + "_Episode_Review_" + j);
                episodeChildReviewLabel.setAttribute("for", "li_" + i + "_Episode_Review_" + j);
            }
        }
    }
};



/*

Reorganize the list items in the associated manga modal.

*/
var mangaListReorganize = () => {
    // Define the related content list.
    const mangaModalList = document.getElementById("mangaList");
    // Iterate through all related content items.
    for(let i = 1; i < mangaModalList.children.length + 1; i++) {
        // Define the associated components to the related content item.
        let child = mangaModalList.children[i - 1],
            currentNum = child.id.split("_")[1],
            childType = child.id.split("_")[2],
            childHeader = child.children[0],
            childBody = child.children[1],
            singleNameInput = childHeader.children[0].children[0],
            singleNameLabel = childHeader.children[0].children[1];
            singleReviewInput = childBody.children[0].children[1].children[0].children[0],
            singleReviewLabel = childBody.children[0].children[1].children[0].children[1];
        if(childType == "Chapter") {
            var singleReleaseInput = childHeader.children[1].children[0],
                singleReleaseLabel = childHeader.children[1].children[1],
                singleLastReadInput = childHeader.children[2].children[0],
                singleLastReadLabel = childHeader.children[2].children[1],
                singleRatingSelect = childHeader.children[3].children[0].children[3];
        }
        else if(childType == "Volume") {
            var singleReleaseInput = childHeader.children[2].children[0],
                singleReleaseLabel = childHeader.children[2].children[1],
                singleLastReadInput = childHeader.children[3].children[0],
                singleLastReadLabel = childHeader.children[3].children[1],
                singleRatingSelect = childHeader.children[4].children[0].children[3];
        }
        // Change the item id and for attributes accordingly.
        child.setAttribute("id", "li_" + i + "_" + childType);
        singleNameInput.setAttribute("id", "li_" + i + "_" + childType + "_Name");
        singleNameLabel.setAttribute("for", "li_" + i + "_" + childType + "_Name");
        singleReleaseInput.setAttribute("id", "li_" + i + "_" + childType + "_Release");
        singleReleaseLabel.setAttribute("for", "li_" + i + "_" + childType + "_Release");
        singleLastReadInput.setAttribute("id", "li_" + i + "_" + childType + "_LastRead");
        singleLastReadLabel.setAttribute("for", "li_" + i + "_" + childType + "_LastRead");
        singleRatingSelect.setAttribute("id", "li_" + i + "_" + childType + "_Rating");
        if(childType == "Volume") {
            let singleISBNInput = childHeader.children[1].children[0],
                singleISBNLabel = childHeader.children[1].children[1],
                singleSynopsisInput = childBody.children[0].children[0].children[0].children[0],
                singleSynopsisLabel = childBody.children[0].children[0].children[0].children[1];
            singleISBNInput.setAttribute("id", "li_" + i + "_" + childType + "_ISBN");
            singleISBNLabel.setAttribute("for", "li_" + i + "_" + childType + "_ISBN");
            singleSynopsisInput.setAttribute("id", "li_" + i + "_" + childType + "_Synopsis");
            singleSynopsisLabel.setAttribute("for", "li_" + i + "_" + childType + "_Synopsis");
        }
        singleReviewInput.setAttribute("id", "li_" + i + "_" + childType + "_Review");
        singleReviewLabel.setAttribute("for", "li_" + i + "_" + childType + "_Review");
    }
};



/*

Listen for change and click events on the related content anime episode table items.

    - ratingSelect is the input corresponding to the episode rating.
    - delButton is the button that deletes an episode.

*/
var animeSeasonContentButtons = (ratingSelect, delButton) => {
    // Listen for a change in the rating of an anime episode.
    ratingSelect.addEventListener("change", e => {
        // Calculate the new average of the anime season rating based on the ratings of the episodes.
        let selectIdArr = e.target.id.split("_"),
            seasonNum = selectIdArr[1],
            episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
            avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
        // Write the new rating average to the page.
        document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
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
        let episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != "");
        // If the list of ratings available has at least one entry then define the average properly.
        if(episodesArrFiltered.length > 0) {
            let avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
        }
        // If there are no ratings available then set the season ratings average to the default value.
        else {
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = "N/A";
        }
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
};



/*

Listen for click events on the related content anime film/ONA/OVA table items.

    - formSingleName is the input corresponding to the film/ONA/OVA name.
    - formSingleReleaseDate is the input corresponding to the film/ONA/OVA release date.
    - formSingleLastWatchedDate is the input corresponding to the film/ONA/OVA last watched date.
    - formSingleRating is the input corresponding to the film/ONA/OVA rating.
    - delSingleBtn is the button that deletes a film/ONA/OVA.

*/
var animeContentSingleButtons = (formSingleName, formSingleReleaseDate, formSingleLastWatchedDate, formSingleRating, delSingleBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formSingleName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleReleaseDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleLastWatchedDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a film/ONA/OVA on the anime associated modal to delete the season.
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
    });
    // Listen for a change in the rating of a film/ONA/OVA.
    formSingleRating.addEventListener("change", e => {
        // Calculate and write the new anime global rating.
        calculateAnimeRating();
    });
};



/*

Listen for click events on the related content manga chapter/volume table items.

    - formSingleName is the input corresponding to the chapter/volume name.
    - formSingleReleaseDate is the input corresponding to the chapter/volume release date.
    - formSingleLastReadDate is the input corresponding to the chapter/volume last read date.
    - formSingleRating is the input corresponding to the chapter/volume rating.
    - fetchSingleBtn is the button that fetches a manga volume's details.
    - delSingleBtn is the button that deletes a chapter/volume.

*/
var mangaContentSingleButtons = (formSingleName, formSingleISBN, formSingleReleaseDate, formSingleLastReadDate, formSingleRating, fetchSingleBtn, delSingleBtn) => {
    // Listen for a click on the item name, item isbn, item start date, or item read date in order to prevent the listed item body from displaying.
    formSingleName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleISBN.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleReleaseDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleLastReadDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a chapter/volume on the manga associated modal to delete the item.
    delSingleBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        mangaListReorganize();
        // Calculate and write the new anime global rating.
        calculateMangaRating();
    });
    // Listen for a change in the rating of a chapter/volume.
    formSingleRating.addEventListener("change", e => {
        // Calculate and write the new anime global rating.
        calculateMangaRating();
    });
    // Listen for a change in the ISBN input.
    formSingleISBN.addEventListener("input", e => {
        // Format the ISBN properly.
        formatISBN(formSingleISBN);
    });
    const volPreloader = document.getElementById("volumeFetchPreloader");
    // Listen for a click event on the fetch details button for a volume on the manga associated modal to make a request to the back-end.
    fetchSingleBtn.addEventListener("click", e => {
        let fetchTargetElem = e.target.parentNode.parentNode.parentNode.parentNode,
            fetchTarget = e.target.getAttribute("id").split("_")[1],
            isbnCandidate = formSingleISBN.value.replace(/-/g, "");
        setTimeout(() => fetchTargetElem.children[1].style.display = "none", 1);
        if(isbnCandidate.length == 10 || isbnCandidate.length == 13) {
            volPreloader.style.visibility = "visible";
            ipcRenderer.send("mangaVolumeFetchDetailsByISBN", [isbnCandidate, fetchTarget]);
        }
        else if(formSingleName.value.length > 0) {
            volPreloader.style.visibility = "visible";
            ipcRenderer.send("mangaVolumeFetchDetailsByName", [formSingleName.value, fetchTarget]);
        }
        else {
            volPreloader.style.visibility = "visible";
            ipcRenderer.send("mangaVolumeFetchDetailsByName", [document.getElementById("mangaName") + ", Vol. " + fetchTarget, fetchTarget]);
        }
    });
    ipcRenderer.on("mangaSingleVolumeFetchDetailsResult", (event, response) => {
        let name = document.getElementById("li_" + response[0] + "_Volume_Name"),
            isbn = document.getElementById("li_" + response[0] + "_Volume_ISBN"),
            rel = document.getElementById("li_" + response[0] + "_Volume_Release"),
            syn = document.getElementById("li_" + response[0] + "_Volume_Synopsis"),
            pub = document.getElementById("mangaPublisher");
            recordImg = document.getElementById("addRecordMangaImg");
        if(response[1] != undefined && response[1] != "") {
            name.value = response[1];
            name.classList.add("valid");
            name.nextElementSibling.classList.add("active");
        }
        else {
            name.classList.remove("valid");
            name.nextElementSibling.classList.remove("active");
        }
        if(response[2] != undefined && !recordImg.getAttribute("list").includes(response[2])) {
            let curLst = recordImg.getAttribute("list"),
                favoriteLink = document.getElementById("mangaFavoriteImageLink");
            if(curLst != "") {
                recordImg.setAttribute("list", curLst + "," + response[2]);
            }
            else {
                recordImg.setAttribute("src", response[2]);
                recordImg.setAttribute("list", response[2]);
            }
            favoriteLink.style.visibility = "visible";
            favoriteLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
        }
        if(response[3] != undefined && response[3] != "") {
            isbn.value = response[3];
            isbn.classList.add("valid");
            isbn.nextElementSibling.classList.add("active");
            formatISBN(isbn);
        }
        else {
            isbn.classList.remove("valid");
            isbn.nextElementSibling.classList.remove("active");
        }
        if(response[4] != undefined && !pub.value.includes(response[4])) {
            pub.value.length > 0 ? pub.value = ", " + response[4] : pub.value = response[4];
            pub.classList.add("valid");
            pub.nextElementSibling.classList.add("active");
        }
        if(response[5] != undefined && response[5] != "") {
            rel.value = (new Date(response[5])).toISOString().split("T")[0];
            rel.classList.add("valid");
        }
        else {
            rel.value = "";
            rel.classList.remove("valid");
        }
        if(response[6] != undefined && response[6] != "") {
            syn.value = response[6];
            syn.classList.add("valid");
            syn.nextElementSibling.classList.add("active");
            M.textareaAutoResize(syn);
        }
        volPreloader.style.visibility = "hidden";
    });
};



/*

Add an episode to an anime related content season.

    - tgt is the document element corresponding to the season table item.

*/
var episodeAddition = tgt => {
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
    seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameInput.classList.add("validate", "left");
    seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameLabel.textContent = "Episode Name:";
    seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode last watched date.
    seasonEpisodeLastWatchedInput.classList.add("validate", "left");
    seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_Episode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedInput.setAttribute("type", "date");
    seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
    seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode rating.
    seasonEpisodeRatingDefOption.setAttribute("value", "");
    seasonEpisodeRatingDefOption.setAttribute("selected", "true");
    seasonEpisodeRatingDefOption.textContent = "N/A";
    seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_Episode_Rating_" + (tgt.children[1].children[0].children.length + 1));
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
    seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
    seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Review_" + (tgt.children[1].children[0].children.length + 1));
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
var animeContentSeasonButtons = (formName, formStartDate, formEndDate, formAverageRating, addBtn, delBtn) => {
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
    });
    // Listen for a click event on the add button for a season on the anime associated modal to add an episode listing.
    addBtn.addEventListener("click", e => {
        // Add an episode to the associated anime.
        episodeAddition(e.target.parentNode.parentNode.parentNode.parentNode);
    });
};



/*

Driver function designed to add a film/ONA/OVA table item in the related content section of an anime record.

*/
var singleAddition = () => {
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
    inputSingleName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Name");
    inputSingleName.setAttribute("type", "text");
    labelSingleName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Name");
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
    selectSingleType.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Type");
    labelSingleType.textContent = "Type:";
    // Prepare the film/ONA/OVA release date.
    divSingleReleaseDate.classList.add("input-field");
    divSingleReleaseDate.style.width = "20%";
    divSingleReleaseDate.style.marginLeft = "25px";
    inputSingleReleaseDate.classList.add("validate", "left");
    inputSingleReleaseDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Release");
    inputSingleReleaseDate.setAttribute("type", "date");
    labelSingleReleaseDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Release");
    labelSingleReleaseDate.textContent = "Release Date:";
    // Prepare the film/ONA/OVA last watched date.
    divSingleLastWatchedDate.classList.add("input-field");
    divSingleLastWatchedDate.style.width = "20%";
    divSingleLastWatchedDate.style.marginLeft = "25px";
    inputSingleLastWatchedDate.classList.add("validate", "left");
    inputSingleLastWatchedDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
    inputSingleLastWatchedDate.setAttribute("type", "date");
    labelSingleLastWatchedDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
    labelSingleLastWatchedDate.textContent = "Last Watched Date:";
    // Prepare the film/ONA/OVA rating.
    divSingleRating.classList.add("input-field", "selectShortVerticalScroll");
    divSingleRating.style.width = "17.5%";
    divSingleRating.style.marginLeft = "25px";
    defOptionSingleRating.setAttribute("value", "");
    defOptionSingleRating.setAttribute("selected", "true");
    defOptionSingleRating.textContent = "N/A";
    selectSingleRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Rating");
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
    inputSingleReview.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Review");
    labelSingleReview.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Review");
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
    itemSingleLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single");
    itemSingleLI.append(itemSingleDivHeader, itemSingleDivBody);
    animeList.append(itemSingleLI);
    // Add the button listeners associated to a film/ONA/OVA.
    animeContentSingleButtons(inputSingleName, inputSingleReleaseDate, inputSingleLastWatchedDate, selectSingleRating, iconSingleDelete);
};



/*

Driver function designed to add a season table item in the related content section of an anime record.

*/
var seasonAddition = () => {
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
    inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Name");
    inputName.setAttribute("type", "text");
    labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Name");
    labelName.textContent = "Season Name:";
    // Prepare the season start date.
    divStartDate.classList.add("input-field");
    divStartDate.style.width = "15%";
    divStartDate.style.marginLeft = "25px";
    inputStartDate.classList.add("validate", "left");
    inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Start");
    inputStartDate.setAttribute("type", "date");
    labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Start");
    labelStartDate.textContent = "Season Start Date:";
    // Prepare the season end date.
    divEndDate.classList.add("input-field");
    divEndDate.style.width = "15%";
    divEndDate.style.marginLeft = "25px";
    inputEndDate.classList.add("validate", "left");
    inputEndDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_End");
    inputEndDate.setAttribute("type", "date");
    labelEndDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_End");
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
    selectStatus.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Status");
    labelStatus.textContent = "Status:";
    // Prepare the season average rating.
    divAverageRating.classList.add("input-field");
    divAverageRating.style.width = "13%";
    divAverageRating.style.marginLeft = "25px";
    inputAverageRating.classList.add("left");
    inputAverageRating.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
    inputAverageRating.setAttribute("type", "text");
    inputAverageRating.readOnly = "true";
    inputAverageRating.value = "N/A";
    labelAverageRating.classList.add("active");
    labelAverageRating.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_AverageRating");
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
    iconAdd.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AddEpisode");
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
    itemLI.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season");
    itemLI.append(itemDivHeader, itemDivBody);
    animeList.append(itemLI);
    // Add the button listeners associated to an anime season.
    animeContentSeasonButtons(inputName, inputStartDate, inputEndDate, inputAverageRating, iconAdd, iconDelete);
};



/*

Driver function designed to add a chapter/volume table item in the related content section of a manga record.

   - scenario is a string taking on either the value "Chapter" or "Volume" to correspond to which item to add.

*/
var mangaItemAddition = scenario => {
    // Define and construct all components needed to attach a manga chapter to the related content table.
    const mangaList = document.getElementById("mangaList"),
        itemSingleLI = document.createElement("li"),
        itemSingleDivHeader = document.createElement("div"),
        divSingleName = document.createElement("div"),
        inputSingleName = document.createElement("input"),
        labelSingleName = document.createElement("label"),
        divSingleReleaseDate = document.createElement("div"),
        inputSingleReleaseDate = document.createElement("input"),
        labelSingleReleaseDate = document.createElement("label"),
        divSingleLastReadDate = document.createElement("div"),
        inputSingleLastReadDate = document.createElement("input"),
        labelSingleLastReadDate = document.createElement("label"),
        divSingleRating = document.createElement("div"),
        selectSingleRating = document.createElement("select"),
        labelSingleRating = document.createElement("label"),
        defOptionSingleRating = document.createElement("option"),
        divSingleFetch = document.createElement("div"),
        spanSingleFetch = document.createElement("span"),
        iconSingleFetch = document.createElement("i"),
        divSingleDelete = document.createElement("div"),
        spanSingleDelete = document.createElement("span"),
        iconSingleDelete = document.createElement("i"),
        itemSingleDivBody = document.createElement("div"),
        itemSingleDivBodyForm = document.createElement("form"),
        divSingleReview = document.createElement("div"),
        spanSingleReview = document.createElement("span"),
        inputSingleReview = document.createElement("textarea"),
        labelSingleReview = document.createElement("label"),
        divSingleISBN = document.createElement("div"),
        inputSingleISBN = document.createElement("input"),
        labelSingleISBN = document.createElement("label"),
        divSingleSynopsis = document.createElement("div"),
        spanSingleSynopsis = document.createElement("span"),
        inputSingleSynopsis = document.createElement("textarea"),
        labelSingleSynopsis = document.createElement("label");
    if(scenario == "Volume") {
        // Prepare the volume item name.
        divSingleName.style.width = "20%";
        // Prepare the volume item isbn.
        divSingleISBN.classList.add("input-field");
        divSingleISBN.style.width = "17.5%";
        divSingleISBN.style.marginLeft = "25px";
        inputSingleISBN.classList.add("validate", "left");
        inputSingleISBN.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_Volume_ISBN");
        inputSingleISBN.setAttribute("type", "text");
        labelSingleISBN.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_Volume_ISBN");
        labelSingleISBN.textContent = "ISBN:";
        divSingleISBN.append(inputSingleISBN, labelSingleISBN);
        // Prepare the volume synopsis.
        divSingleSynopsis.classList.add("row");
        spanSingleSynopsis.classList.add("input-field", "col", "s12");
        inputSingleSynopsis.classList.add("validate", "materialize-textarea", "mangaVolumeSynopsis");
        inputSingleSynopsis.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_Volume_Synopsis");
        labelSingleSynopsis.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_Volume_Synopsis");
        labelSingleSynopsis.textContent = "Synopsis:";
        spanSingleSynopsis.append(inputSingleSynopsis, labelSingleSynopsis);
        divSingleSynopsis.append(spanSingleSynopsis);
    }
    else if(scenario == "Chapter") {
        // Prepare the chapter item name.
        divSingleName.style.width = "25%";
        inputSingleName.value = "Chapter " + (Array.from(mangaList.children).filter(li => li.getAttribute("id").split("_")[2] == "Chapter").length + 1);
        inputSingleName.classList.add("valid");
        labelSingleName.classList.add("active");
    }
    // Prepare the chapter/volume item name.
    divSingleName.classList.add("input-field");
    inputSingleName.classList.add("validate", "left");
    inputSingleName.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Name");
    inputSingleName.setAttribute("type", "text");
    labelSingleName.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Name");
    labelSingleName.textContent = "Name:";
    // Prepare the chapter/volume item release date.
    divSingleReleaseDate.classList.add("input-field");
    scenario == "Volume" ? divSingleReleaseDate.style.width = "20%" : divSingleReleaseDate.style.width = "25%";
    divSingleReleaseDate.style.marginLeft = "25px";
    inputSingleReleaseDate.classList.add("validate", "left");
    inputSingleReleaseDate.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Release");
    inputSingleReleaseDate.setAttribute("type", "date");
    labelSingleReleaseDate.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Release");
    labelSingleReleaseDate.textContent = "Release Date:";
    // Prepare the chapter/volume last read date.
    divSingleLastReadDate.classList.add("input-field");
    scenario == "Volume" ? divSingleLastReadDate.style.width = "20%" : divSingleLastReadDate.style.width = "25%";
    divSingleLastReadDate.style.marginLeft = "25px";
    inputSingleLastReadDate.classList.add("validate", "left");
    inputSingleLastReadDate.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_LastRead");
    inputSingleLastReadDate.setAttribute("type", "date");
    labelSingleLastReadDate.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_LastRead");
    labelSingleLastReadDate.textContent = "Last Read Date:";
    // Prepare the chapter/volume item rating.
    divSingleRating.classList.add("input-field", "selectShortVerticalScroll");
    scenario == "Volume" ? divSingleRating.style.width = "12.5%" : divSingleRating.style.width = "20%";
    divSingleRating.style.marginLeft = "25px";
    defOptionSingleRating.setAttribute("value", "");
    defOptionSingleRating.setAttribute("selected", "true");
    defOptionSingleRating.textContent = "N/A";
    selectSingleRating.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Rating");
    selectSingleRating.append(defOptionSingleRating);
    for(let t = 0; t < 11; t++) {
        let newOption = document.createElement("option");
        newOption.setAttribute("value", t);
        newOption.textContent = t + "/10";
        selectSingleRating.append(newOption);
    }
    labelSingleRating.textContent = "Rating:";
    // Prepare the volume button for fetching details.
    divSingleFetch.classList.add("input-field");
    divSingleFetch.style.width = "5%";
    divSingleFetch.style.marginLeft = "25px";
    spanSingleFetch.classList.add("center", "tooltipped");
    spanSingleFetch.setAttribute("data-position", "top");
    spanSingleFetch.setAttribute("data-tooltip", "Fetch Details");
    spanSingleFetch.classList.add("modalContentButtons", "modalContentAdd");
    iconSingleFetch.textContent = "refresh";
    iconSingleFetch.classList.add("material-icons");
    iconSingleFetch.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_Volume_Fetch");
    // Prepare the button for deleting a chapter/volume.
    divSingleDelete.classList.add("input-field");
    divSingleDelete.style.width = "5%";
    divSingleDelete.style.marginLeft = "25px";
    spanSingleDelete.classList.add("center", "tooltipped");
    spanSingleDelete.setAttribute("data-position", "top");
    spanSingleDelete.setAttribute("data-tooltip", "Delete");
    spanSingleDelete.classList.add("modalContentButtons", "modalContentDelete");
    iconSingleDelete.textContent = "delete_sweep";
    iconSingleDelete.classList.add("material-icons");
    // Prepare the chapter/volume review.
    divSingleReview.classList.add("row");
    spanSingleReview.classList.add("input-field", "col", "s12");
    inputSingleReview.classList.add("validate", "materialize-textarea");
    inputSingleReview.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Review");
    labelSingleReview.setAttribute("for", "li_" + (mangaList.children.length + 1) + "_" + scenario + "_Review");
    labelSingleReview.textContent = "Comments/Review:";
    // Attach all chapter/volume components to the list item.
    itemSingleDivHeader.classList.add("collapsible-header");
    itemSingleDivBody.classList.add("collapsible-body");
    divSingleName.append(inputSingleName, labelSingleName);
    divSingleReleaseDate.append(inputSingleReleaseDate, labelSingleReleaseDate);
    divSingleLastReadDate.append(inputSingleLastReadDate, labelSingleLastReadDate);
    divSingleRating.append(selectSingleRating, labelSingleRating);
    spanSingleReview.append(inputSingleReview, labelSingleReview);
    divSingleReview.append(spanSingleReview);
    spanSingleFetch.append(iconSingleFetch);
    divSingleFetch.append(spanSingleFetch);
    spanSingleDelete.append(iconSingleDelete);
    divSingleDelete.append(spanSingleDelete);
    if(scenario == "Chapter") {
        itemSingleDivHeader.append(divSingleName, divSingleReleaseDate, divSingleLastReadDate, divSingleRating, divSingleDelete);
    }
    else if(scenario == "Volume") {
        itemSingleDivHeader.append(divSingleName, divSingleISBN, divSingleReleaseDate, divSingleLastReadDate, divSingleRating, divSingleFetch, divSingleDelete);
    }
    // Attach the div designed to house the chapter/volume review.
    itemSingleDivBodyForm.classList.add("col", "s12");
    scenario == "Volume" ? itemSingleDivBodyForm.append(divSingleSynopsis) : itemSingleDivBodyForm.append(document.createElement("div"));
    itemSingleDivBodyForm.append(divSingleReview);
    itemSingleDivBody.append(itemSingleDivBodyForm);
    // Attach the list item to the page modal.
    itemSingleLI.setAttribute("draggable", "true");
    itemSingleLI.classList.add("dropzone");
    itemSingleLI.setAttribute("id", "li_" + (mangaList.children.length + 1) + "_" + scenario);
    itemSingleLI.append(itemSingleDivHeader, itemSingleDivBody);
    mangaList.append(itemSingleLI);
    // Add the button listeners associated to a chapter/volume.
    mangaContentSingleButtons(inputSingleName, inputSingleISBN, inputSingleReleaseDate, inputSingleLastReadDate, selectSingleRating, iconSingleFetch, iconSingleDelete);
};



/*

Initializes select tags and tooltips. Designed to be executed after all related content items have been added.

*/
var relatedContentFinisher = () => {
    // Initialize the select tags.
    initSelect();
    // Initialize the tooltips.
    initTooltips();
    // Initialize the observers for all relevant select tags.
    initSelectObservers();
};



/*

Addes the appropriate event listeners to ensure that page items are highlighted only in the event that a change in the original value is detected.

   - item is the page element to which the change and click events will be attached.

*/
var relatedContentListeners = item => {
    const listenerFunc = e => e.target.value == e.target.getAttribute("lastValue") ? e.target.classList.remove("validate", "valid") : e.target.classList.add("validate", "valid");
    item.addEventListener("change", listenerFunc);
    item.addEventListener("click", listenerFunc);
};