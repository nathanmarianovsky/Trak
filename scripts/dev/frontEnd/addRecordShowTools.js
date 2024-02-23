/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on show records.

    - showSave: Processes the information required to save a show record.
    - showModalButtons: Listen for click events on the related content show modal buttons.
    - resetShowContentCounters: Resets the page counters for a show record's related content.
    - calculateShowRating: Calculates the average rating for a show based on the available ratings for all seasons.
    - showListReorganize: Reorganize the list items in the associated show modal.
    - showSeasonContentButtons: Listen for change and click events on the related content show episode table items.
    - showEpisodeAddition: Add an episode to a show related content season.
    - showContentSeasonButtons: Listen for click events on the related content show season table items.
    - showSeasonAddition: Driver function designed to add a season table item in the related content section of a show record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a show record.

*/
var showSave = () => {
    // Define the page save button.
    const showSaveBtn = document.getElementById("showSave");
    // Listen for a click on the save button.
    showSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const showList = document.getElementById("showList"),
            showName = document.getElementById("showName").value,
            showAlternateName = document.getElementById("showAlternateName").value,
            showReview = document.getElementById("showReview").value,
            showDirectors = document.getElementById("showDirectors").value,
            showProducers = document.getElementById("showProducers").value,
            showWriters = document.getElementById("showWriters").value,
            showMusicians = document.getElementById("showMusicians").value,
            showEditors = document.getElementById("showEditors").value,
            showCinematographers = document.getElementById("showCinematographers").value,
            showDistributors = document.getElementById("showDistributors").value,
            showProductionCompanies = document.getElementById("showProductionCompanies").value,
            showStarring = document.getElementById("showStarring").value,
            showSynopsis = document.getElementById("showSynopsis").value,
            showRating = document.getElementById("showRating").value,
            showReleaseDate = document.getElementById("showReleaseDate").value,
            showRunningTime = document.getElementById("showRunningTime").value,
            showLastWatched = document.getElementById("showLastWatched").value,
            showImg = document.getElementById("addRecordShowImg").getAttribute("list").split(","),
            showFiles = Array.from(document.getElementById("showAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("showOtherGenres").value.split(",").map(elem => elem.trim()),
            genresLst = genreList("Show"),
            genres = [],
            content = [];
        // Check to see that a name was provided.
        if(showName != "") {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("showGenre" + genresLst[p]).checked);
            }
            // For each table item in the related content table process the associated information.
            for(let q = 1; q < showList.children.length + 1; q++) {
                let showListChild = showList.children[q - 1],
                    showListChildCondition = showListChild.id.split("_")[2],
                    curContent = [];
                // Attain the details on a season and its episodes.
                let seasonName = document.getElementById("li_" + q + "_ShowSeason_Name").value,
                    seasonStart = document.getElementById("li_" + q + "_ShowSeason_Start").value,
                    seasonEnd = document.getElementById("li_" + q + "_ShowSeason_End").value,
                    seasonStatus = document.getElementById("li_" + q + "_ShowSeason_Status").value,
                    seasonEpisodes = [];
                for(let r = 1; r < showListChild.children[1].children[0].children.length + 1; r++) {
                    let seasonEpisodeName = document.getElementById("li_" + q + "_ShowEpisode_Name_" + r).value,
                        seasonEpisodeLastWatched = document.getElementById("li_" + q + "_ShowEpisode_LastWatched_" + r).value,
                        seasonEpisodeRating = document.getElementById("li_" + q + "_ShowEpisode_Rating_" + r).value,
                        seasonEpisodeReview = document.getElementById("li_" + q + "_ShowEpisode_Review_" + r).value;
                    seasonEpisodes.push([seasonEpisodeName, seasonEpisodeLastWatched, seasonEpisodeRating, seasonEpisodeReview]);
                }
                curContent.push("Season", seasonName, seasonStart, seasonEnd, seasonStatus, seasonEpisodes);
                // Push the table item information into the array holding all related content details.
                content.push(curContent);
            }
            const ogName = document.getElementById("showName").getAttribute("oldName"),
                oldTitle = ogName !== null ? ogName : showName;
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Show", showName, showAlternateName, showReview, showDirectors, showProducers, showWriters, showMusicians, showEditors,
                showCinematographers, showFiles, showDistributors, showProductionCompanies, showStarring, [genresLst, genres, otherGenres], showSynopsis, showRating, showReleaseDate, showRunningTime,
                showLastWatched, [document.getElementById("addRecordShowImg").getAttribute("list") == document.getElementById("addRecordShowImg").getAttribute("previous"), showImg], content, oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "A show record requires a name be provided.", "classes": "rounded"}); }
    });
};



/*

Listen for click events on the related content show modal buttons.

*/
var showModalButtons = () => {
    // Define the buttons for all actions.
    const showAddSeason = document.getElementById("showAddSeason");
    // Listen for a click event on the show related content season creation button.
    showAddSeason.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new season.
        clearTooltips();
        showSeasonAddition();
        relatedContentFinisher();
        resetShowContentCounters();
    });
};



/*

Resets the page counters for a show record's related content.

*/
var resetShowContentCounters = () => {
    const itemList = Array.from(document.getElementById("showList").children),
        showSeasonCount = document.getElementById("showSeasonCount"),
        showEpisodeCount = document.getElementById("showEpisodeCount");
    let seasonCount = 0, episodeCount = 0;
    for(let w = 0; w < itemList.length; w++) {
        let scenario = itemList[w].getAttribute("id").split("_")[2];
        seasonCount++;
        episodeCount += itemList[w].children[1].children[0].children.length;
    }
    counterAssignment(showSeasonCount, seasonCount);
    counterAssignment(showEpisodeCount, episodeCount);
};



/*

Calculates the average rating for a show based on the available ratings for all seasons.

*/
var calculateShowRating = () => {
    // Define the related content list and global ratings input.
    const relevantList = document.getElementById("showList"),
        globalRating = document.getElementById("showRating");
    // Initialize the overall sum and count of items utilized in the sum.
    let sum = 0, count = 0;
    // Iterate through all related content items.
    for(let k = 0; k < relevantList.children.length; k++) {
        let seasonValue = relevantList.children[k].children[0].children[4].children[0].value;
        if(seasonValue != "N/A") {
            sum += parseFloat(seasonValue);
            count++;
        }
    }
    // Update the page global rating input accordingly.
    count == 0 ? globalRating.value = "N/A" : globalRating.value = (sum / count).toFixed(2);
};



/*

Reorganize the list items in the associated show modal.

*/
var showListReorganize = () => {
    // Define the related content list.
    const showModalList = document.getElementById("showList");
    // Iterate through all related content items.
    for(let i = 1; i < showModalList.children.length + 1; i++) {
        // Define the associated components to the related content item.
        let child = showModalList.children[i - 1],
            currentNum = child.id.split("_")[1],
            childType = child.id.split("_")[2],
            childHeader = child.children[0],
            childBody = child.children[1];
        // Change the id and for attributes accordingly.
        let seasonNameInput = childHeader.children[0].children[0],
            seasonNameLabel = childHeader.children[0].children[1],
            seasonStartInput = childHeader.children[1].children[0],
            seasonStartLabel = childHeader.children[1].children[1],
            seasonEndInput = childHeader.children[2].children[0],
            seasonEndLabel = childHeader.children[2].children[1],
            seasonStatusSelect = childHeader.children[3].children[0].children[3],
            seasonAverageRatingInput = childHeader.children[4].children[0],
            seasonAverageRatingLabel = childHeader.children[4].children[1];
        child.setAttribute("id", "li_" + i + "_ShowSeason");
        seasonNameInput.setAttribute("id", "li_" + i + "_ShowSeason_Name");
        seasonNameLabel.setAttribute("for", "li_" + i + "_ShowSeason_Name");
        seasonStartInput.setAttribute("id", "li_" + i + "_ShowSeason_Start");
        seasonStartLabel.setAttribute("for", "li_" + i + "_ShowSeason_Start");
        seasonEndInput.setAttribute("id", "li_" + i + "_ShowSeason_End");
        seasonEndLabel.setAttribute("for", "li_" + i + "_ShowSeason_End");
        seasonStatusSelect.setAttribute("id", "li_" + i + "_ShowSeason_Status");
        seasonAverageRatingInput.setAttribute("id", "li_" + i + "_ShowSeason_AverageRating");
        seasonAverageRatingLabel.setAttribute("for", "li_" + i + "_ShowSeason_AverageRating");
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
            episodeChildNameInput.setAttribute("id", "li_" + i + "_ShowEpisode_Name_" + j);
            episodeChildNameLabel.setAttribute("for", "li_" + i + "_ShowEpisode_Name_" + j);
            episodeChildLastWatchedInput.setAttribute("id", "li_" + i + "_ShowEpisode_LastWatched_" + j);
            episodeChildLastWatchedLabel.setAttribute("for", "li_" + i + "_ShowEpisode_LastWatched_" + j);
            episodeChildRatingSelect.setAttribute("id", "li_" + i + "_ShowEpisode_Rating_" + j);
            episodeChildReviewInput.setAttribute("id", "li_" + i + "_ShowEpisode_Review_" + j);
            episodeChildReviewLabel.setAttribute("for", "li_" + i + "_ShowEpisode_Review_" + j);
        }
    }
};



/*

Listen for change and click events on the related content show episode table items.

    - ratingSelect is the input corresponding to the episode rating.
    - delButton is the button that deletes an episode.

*/
var showSeasonContentButtons = (ratingSelect, delButton) => {
    // Listen for a change in the rating of a show episode.
    ratingSelect.addEventListener("change", e => {
        // Calculate the new average of the show season rating based on the ratings of the episodes.
        let selectIdArr = e.target.id.split("_"),
            seasonNum = selectIdArr[1],
            episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_ShowEpisode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
            avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
        // Write the new rating average to the page.
        document.getElementById("li_" + seasonNum + "_ShowSeason_AverageRating").value = avg.toFixed(2);
        // Calculate and write the new show global rating.
        calculateShowRating();
    });
    // Listen for a click on the delete button of a show season episode.
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
        showListReorganize();
        // Calculate the new average of the show season rating based on the ratings of the episodes.
        let episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_ShowEpisode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != "");
        // If the list of ratings available has at least one entry then define the average properly.
        if(episodesArrFiltered.length > 0) {
            let avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_ShowSeason_AverageRating").value = avg.toFixed(2);
        }
        // If there are no ratings available then set the season ratings average to the default value.
        else {
            // Write the new rating average to the page.
            document.getElementById("li_" + seasonNum + "_ShowSeason_AverageRating").value = "N/A";
        }
        // Calculate and write the new show global rating.
        calculateShowRating();
    });
};



/*

Add an episode to a show related content season.

    - tgt is the document element corresponding to the season table item.

*/
var showEpisodeAddition = tgt => {
    // Remove the tooltips.
    clearTooltips();
    // Define the list item id.
    const addTargetNum = tgt.id.split("_")[1];
    tgt.classList.remove("active");
    // Define and construct all components needed to attach a show season episode to the related content table.
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
    seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_ShowEpisode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameInput.classList.add("validate", "left");
    seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_ShowEpisode_Name_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeNameLabel.textContent = "Episode Name:";
    seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode last watched date.
    seasonEpisodeLastWatchedInput.classList.add("validate", "left");
    seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_ShowEpisode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedInput.setAttribute("type", "date");
    seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_ShowEpisode_LastWatched_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
    seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");
    // Prepare the season episode rating.
    seasonEpisodeRatingDefOption.setAttribute("value", "");
    seasonEpisodeRatingDefOption.setAttribute("selected", "true");
    seasonEpisodeRatingDefOption.textContent = "N/A";
    seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_ShowEpisode_Rating_" + (tgt.children[1].children[0].children.length + 1));
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
    seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_ShowEpisode_Review_" + (tgt.children[1].children[0].children.length + 1));
    seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
    seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_ShowEpisode_Review_" + (tgt.children[1].children[0].children.length + 1));
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
    // Add the button listeners associated to a show season episode.
    showSeasonContentButtons(seasonEpisodeRatingSelect, seasonEpisodeDeleteIcon);
};



/*

Listen for click events on the related content show season table items.

    - formName is the input corresponding to the season name.
    - formStartDate is the input corresponding to the season start date.
    - formEndDate is the input corresponding to the season end date.
    - formAverageRating is the input corresponding to the season average rating.
    - addBtn is the button that adds a season episode.
    - delBtn is the button that deletes a season.

*/
var showContentSeasonButtons = (formName, formStartDate, formEndDate, formAverageRating, addBtn, delBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formStartDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formEndDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formAverageRating.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a season on the show associated modal to delete the season.
    delBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
        // Reoganize the ids of the modal list items.
        showListReorganize();
        // Calculate and write the new show global rating.
        calculateShowRating();
    });
    // Listen for a click event on the add button for a season on the show associated modal to add an episode listing.
    addBtn.addEventListener("click", e => {
        // Add an episode to the associated show.
        showEpisodeAddition(e.target.parentNode.parentNode.parentNode.parentNode);
    });
};



/*

Driver function designed to add a season table item in the related content section of a show record.

*/
var showSeasonAddition = () => {
    console.log("hello");
    // Define and construct all components needed to attach a show season to the related content table.
    const showList = document.getElementById("showList"),
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
    inputName.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_Name");
    inputName.setAttribute("type", "text");
    labelName.setAttribute("for", "li_" + (showList.children.length + 1) + "_ShowSeason_Name");
    labelName.textContent = "Season Name:";
    // Prepare the season start date.
    divStartDate.classList.add("input-field");
    divStartDate.style.width = "15%";
    divStartDate.style.marginLeft = "25px";
    inputStartDate.classList.add("validate", "left");
    inputStartDate.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_Start");
    inputStartDate.setAttribute("type", "date");
    labelStartDate.setAttribute("for", "li_" + (showList.children.length + 1) + "_ShowSeason_Start");
    labelStartDate.textContent = "Season Start Date:";
    // Prepare the season end date.
    divEndDate.classList.add("input-field");
    divEndDate.style.width = "15%";
    divEndDate.style.marginLeft = "25px";
    inputEndDate.classList.add("validate", "left");
    inputEndDate.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_End");
    inputEndDate.setAttribute("type", "date");
    labelEndDate.setAttribute("for", "li_" + (showList.children.length + 1) + "_ShowSeason_End");
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
    selectStatus.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_Status");
    labelStatus.textContent = "Status:";
    // Prepare the season average rating.
    divAverageRating.classList.add("input-field");
    divAverageRating.style.width = "13%";
    divAverageRating.style.marginLeft = "25px";
    inputAverageRating.classList.add("left");
    inputAverageRating.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_AverageRating");
    inputAverageRating.setAttribute("type", "text");
    inputAverageRating.readOnly = "true";
    inputAverageRating.value = "N/A";
    labelAverageRating.classList.add("active");
    labelAverageRating.setAttribute("for", "li_" + (showList.children.length + 1) + "_ShowSeason_AverageRating");
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
    iconAdd.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason_AddEpisode");
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
    itemLI.setAttribute("id", "li_" + (showList.children.length + 1) + "_ShowSeason");
    itemLI.append(itemDivHeader, itemDivBody);
    showList.append(itemLI);
    // Add the button listeners associated to an show season.
    showContentSeasonButtons(inputName, inputStartDate, inputEndDate, inputAverageRating, iconAdd, iconDelete);
};