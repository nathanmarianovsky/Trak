/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

    - clearTooltips: Remove all tooltips on the page.
    - initTooltips: Initialize all tooltips on the page.
    - initSelect: Initialize all select tags on the page.
    - initSelectObservers: Initialize the observers for style mutations on related content select tags.
    - initContentDrag: Initialize the listeners associated to related content dragging.
    - recordChoicesButtons: Listen for click events on the record choices.
    - animeSeasonContentButtons: Listen for click events on the related content anime episode table items.
    - animeContentSeasonButtons: Listen for click events on the related content anime season table items.
    - animeModalButtons: Listen for click events on the related content anime modal buttons.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Declare all of the necessary variables.

    - ipcRenderer provides the means to operate the Electron app.

*/
var { ipcRenderer } = require("electron");



/*

Remove all tooltips on the page.

*/
var clearTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
    // Destroy each tooltip.
    for(let j = 0; j < instancesTooltips.length; j++) { instancesTooltips[j].destroy(); }
};



/*

Initialize all tooltips on the page.

*/
var initTooltips = () => {
    // Define the current instances of tooltips found on the page.
    let elemsTooltips = document.querySelectorAll(".tooltipped"),
        instancesTooltips = M.Tooltip.init(elemsTooltips);
};



/*

Initialize all select tags on the page.

*/
var initSelect = () => {
    // Define the current instances of select tags fonud on the page.
    let elemsSelect = document.querySelectorAll("select"),
        instancesSelect = M.FormSelect.init(elemsSelect);
};



/*

Initialize the observers for style mutations on related content select tags.

*/
var initSelectObservers = () => {
    // Define the select tags observer.
    let observer = new MutationObserver(mutations => {
        // Define the listed item target in the unordered list.
        let target = mutations[0].target.parentNode.parentNode.parentNode.parentNode;
        // If this select tag is a desired target then hide the body of episodes associated to an anime season.
        if(target.classList.contains("dropzone")) {
            setTimeout(() => target.children[1].style.display = "none", 1);
        }
    });
    // Define the list of all relevant select tags on the modal.
    let lst = document.querySelectorAll(".modal .dropdown-content");
    // For each relevant select tag tell the observe to watch for changes.
    for(let i = 0; i < lst.length; i++) {
        observer.observe(lst[i], { "attributes": true, "attributeFilter": ["style"] });
    }
};



/*

Initialize the listeners associated to related content dragging.

*/
var initContentDrag = () => {
    // Define the variables associated to the drag action.
    let dragged = "", id = 0, index = 0, indexDrop = 0, list = [];
    // Listen for the start of a drag event on the related content.
    document.addEventListener("dragstart", ({target}) => {
        // If the target does not correspond to the necessary li container, then switch it accordingly.
        if(target.nodeName != "LI") { target = target.closest(".dropzone"); }
        dragged = target;
        id = target.id.split("_")[1];
        list = target.parentNode.children;
        for(let i = 0; i < list.length; i += 1) {
            if(list[i] === dragged){ index = i; }
        }
    });
    // Prevent the default action duruing a drag over.
    document.addEventListener("dragover", (event) => { event.preventDefault(); });
    // Listen for the end of a drag event on the related content.
    document.addEventListener("drop", ({target}) => {
        // If the target does not correspond to the necessary li container, then switch it accordingly.
        if(target.nodeName != "LI") { target = target.closest(".dropzone"); }
        if(target.className == "dropzone" && target.id.split("_")[1] !== id) {
            dragged.remove(dragged);
            for(let i = 0; i < list.length; i += 1) {
                if(list[i] === target) { indexDrop = i; }
            }
            index > indexDrop ? target.before(dragged) : target.after(dragged);
        }
    });
};



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
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv");
    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        if(directionsTitle.style.display != "none") {
            directionsTitle.style.display = "none";
            directionsText.style.display = "none";
        }
        else if(!categoryAnime.parentNode.classList.contains("active")) {
            categoryDivs.style.display = "none";
        }
        categoryAnimeDiv.style.display = "initial";
        categoryAnime.parentNode.classList.add("active");
    });
};



/*

Listen for click events on the related content anime episode table items.

    - ratingSelect is the input corresponding to the episode rating.
    - delButton is the button that deletes an episode.

*/
var animeSeasonContentButtons = (ratingSelect, delButton) => {
    ratingSelect.addEventListener("change", e => {
        let selectIdArr = e.target.id.split("_"),
            seasonNum = selectIdArr[1],
            episodesArr = document.querySelectorAll('[id^="li_' + seasonNum + '_Episode_Rating_"]'),
            episodesArrFiltered = Array.from(episodesArr).filter(elem => elem.value != ""),
            avg = episodesArrFiltered.reduce((total, current) => total + parseInt(current.value), 0) / episodesArrFiltered.length;
        document.getElementById("li_" + seasonNum + "_Season_AverageRating").value = avg.toFixed(2);
    });

    delButton.addEventListener("click", e => {
        let delTarget = e.target.parentNode.parentNode.parentNode;
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
    });
};



/*

Listen for click events on the related content anime season table items.

    - formSingleName is the input corresponding to the film/ONA/OVA name.
    - formSingleReleaseDate is the input corresponding to the film/ONA/OVA release date.
    - formSingleLastWatchedDate is the input corresponding to the film/ONA/OVA last watched date.
    - delSingleBtn is the button that deletes a film/ONA/OVA.

*/
var animeContentSingleButtons = (formSingleName, formSingleReleaseDate, formSingleLastWatchedDate, delSingleBtn) => {
    // Listen for a click on the season name, season start date, season end date, or season average rating in order to prevent the listed item body from displaying.
    formSingleName.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleReleaseDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    formSingleLastWatchedDate.addEventListener("click", e => setTimeout(() => e.target.parentNode.parentNode.parentNode.children[1].style.display = "none", 1));
    // Listen for a click event on the delete button for a season on the anime associated modal to delete the season.
    delSingleBtn.addEventListener("click", e => { 
        let delTarget = e.target.parentNode.parentNode.parentNode.parentNode;
        setTimeout(() => delTarget.children[1].style.display = "none", 1);
        // Remove the tooltips.
        clearTooltips();
        delTarget.remove();
        // Initialize the tooltips.
        initTooltips();
    });
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
    });
    // Listen for a click event on the add button for a season on the anime associated modal to add an episode listing.
    addBtn.addEventListener("click", e => {
        // Remove the tooltips.
        clearTooltips();
        // Define the list item target.
        const addTarget = e.target.parentNode.parentNode.parentNode.parentNode,
            addTargetNum = e.target.id.split("_")[1];
        addTarget.classList.remove("active");
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
        seasonEpisodeNameInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Name_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeNameInput.classList.add("validate", "center");
        seasonEpisodeNameLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Name_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeNameLabel.textContent = "Episode Name:";
        seasonEpisodeNameDiv.classList.add("input-field", "col", "s2");
        // Prepare the season episode last watched date.
        seasonEpisodeLastWatchedInput.classList.add("validate", "center");
        seasonEpisodeLastWatchedInput.setAttribute("id", "li_" + addTargetNum + "_Episode_LastWatched_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeLastWatchedInput.setAttribute("type", "date");
        seasonEpisodeLastWatchedLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_LastWatched_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeLastWatchedLabel.textContent = "Last Watched:";
        seasonEpisodeLastWatchedDiv.classList.add("input-field", "col", "s2");
        // Prepare the season episode rating.
        seasonEpisodeRatingDefOption.setAttribute("value", "");
        seasonEpisodeRatingDefOption.setAttribute("selected", "true");
        seasonEpisodeRatingDefOption.textContent = "N/A";
        seasonEpisodeRatingSelect.setAttribute("id", "li_" + addTargetNum + "_Episode_Rating_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeRatingSelect.append(seasonEpisodeRatingDefOption);
        for(let t = 0; t < 11; t++) {
            let newOption = document.createElement("option");
            newOption.setAttribute("value", t);
            newOption.textContent = t + "/10";
            seasonEpisodeRatingSelect.append(newOption);
        }
        seasonEpisodeRatingLabel.textContent = "Rating:";
        seasonEpisodeRatingDiv.classList.add("input-field", "col", "s2");
        // Prepare the season episode review.
        seasonEpisodeReviewInput.setAttribute("id", "li_" + addTargetNum + "_Episode_Review_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeReviewInput.classList.add("validate", "materialize-textarea");
        seasonEpisodeReviewLabel.setAttribute("for", "li_" + addTargetNum + "_Episode_Review_" + (addTarget.children[1].children[0].children.length + 1));
        seasonEpisodeReviewLabel.textContent = "Review:";
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
        addTarget.children[1].children[0].append(rowDiv);
        // Initialize the select tags.
        initSelect();
        // Initialize the tooltips.
        initTooltips();
        // Initialize the observers for all relevant select tags.
        initSelectObservers();
        // Add the button listeners associated to an anime season episode.
        animeSeasonContentButtons(seasonEpisodeRatingSelect, seasonEpisodeDeleteIcon);
    });
};



/*

Listen for click events on the related content anime modal buttons.

*/
var animeModalButtons = () => {
    // Define the buttons for all actions.
    const animeAddSingle = document.getElementById("animeAddSingle"),
        animeAddSeason = document.getElementById("animeAddSeason");
    animeAddSingle.addEventListener("click", e => {
        // Remove the tooltips.
        clearTooltips();
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
        inputSingleName.classList.add("validate", "center");
        inputSingleName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Name");
        inputSingleName.setAttribute("type", "text");
        labelSingleName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Name");
        labelSingleName.textContent = "Name:";
        // Prepare the season status.
        divSingleType.classList.add("input-field");
        divSingleType.style.width = "17.5%";
        divSingleType.style.marginLeft = "25px";
        option1SingleType.setAttribute("value", "");
        option1SingleType.textContent = "N/A";
        option2SingleType.setAttribute("value", "Film");
        option2SingleType.textContent = "Film";
        option3SingleType.setAttribute("value", "ONA");
        option3SingleType.textContent = "ONA";
        option4SingleType.setAttribute("value", "OVA");
        option4SingleType.textContent = "OVA";
        selectSingleType.append(option1SingleType, option2SingleType, option3SingleType, option4SingleType);
        labelSingleType.textContent = "Type:";
        // Prepare the film/ONA/OVA release date.
        divSingleReleaseDate.classList.add("input-field");
        divSingleReleaseDate.style.width = "20%";
        divSingleReleaseDate.style.marginLeft = "25px";
        inputSingleReleaseDate.classList.add("validate", "center");
        inputSingleReleaseDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_Release");
        inputSingleReleaseDate.setAttribute("type", "date");
        labelSingleReleaseDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_Release");
        labelSingleReleaseDate.textContent = "Release Date:";
        // Prepare the film/ONA/OVA last watched date.
        divSingleLastWatchedDate.classList.add("input-field");
        divSingleLastWatchedDate.style.width = "20%";
        divSingleLastWatchedDate.style.marginLeft = "25px";
        inputSingleLastWatchedDate.classList.add("validate", "center");
        inputSingleLastWatchedDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
        inputSingleLastWatchedDate.setAttribute("type", "date");
        labelSingleLastWatchedDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Single_LastWatched");
        labelSingleLastWatchedDate.textContent = "Last Watched Date:";
        // Prepare the film/ONA/OVA rating.
        divSingleRating.classList.add("input-field");
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
        // Prepare the season button for deleting the season.
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
        labelSingleReview.textContent = "Review";
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
        itemSingleLI.setAttribute("id", "li_" + (animeList.children.length + 1));
        itemSingleLI.append(itemSingleDivHeader, itemSingleDivBody);
        animeList.append(itemSingleLI);
        // Add the button listeners associated to a film/ONA/OVA.
        animeContentSingleButtons(inputSingleName, inputSingleReleaseDate, inputSingleLastWatchedDate, iconSingleDelete);
        // Initialize the select tags.
        initSelect();
        // Initialize the tooltips.
        initTooltips();
        // Initialize the observers for all relevant select tags.
        initSelectObservers();
        // Initialize the dragging of the related content.
        initContentDrag();
    });


    // Listen for a click event on the animeAddSeason button on the anime associated modal to add a season listing.
    animeAddSeason.addEventListener("click", e => {
        // Remove the tooltips.
        clearTooltips();
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
        inputName.classList.add("validate", "center");
        inputName.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Name");
        inputName.setAttribute("type", "text");
        labelName.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Name");
        labelName.textContent = "Season Name:";
        // Prepare the season start date.
        divStartDate.classList.add("input-field");
        divStartDate.style.width = "15%";
        divStartDate.style.marginLeft = "25px";
        inputStartDate.classList.add("validate", "center");
        inputStartDate.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_Start");
        inputStartDate.setAttribute("type", "date");
        labelStartDate.setAttribute("for", "li_" + (animeList.children.length + 1) + "_Season_Start");
        labelStartDate.textContent = "Season Start Date:";
        // Prepare the season end date.
        divEndDate.classList.add("input-field");
        divEndDate.style.width = "15%";
        divEndDate.style.marginLeft = "25px";
        inputEndDate.classList.add("validate", "center");
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
        labelStatus.textContent = "Status:";
        // Prepare the season average rating.
        divAverageRating.classList.add("input-field");
        divAverageRating.style.width = "13%";
        divAverageRating.style.marginLeft = "25px";
        inputAverageRating.classList.add("center");
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
        iconAdd.setAttribute("id", "li_" + (animeList.children.length + 1) + "_Season_AddEpisode")
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
        itemLI.setAttribute("id", "li_" + (animeList.children.length + 1));
        itemLI.append(itemDivHeader, itemDivBody);
        animeList.append(itemLI);
        // Add the button listeners associated to an anime season.
        animeContentSeasonButtons(inputName, inputStartDate, inputEndDate, inputAverageRating, iconAdd, iconDelete);
        // Initialize the select tags.
        initSelect();
        // Initialize the tooltips.
        initTooltips();
        // Initialize the observers for all relevant select tags.
        initSelectObservers();
        // Initialize the dragging of the related content.
        initContentDrag();
    });
};



// Wait for the window to finish loading.
window.addEventListener("load", () => {
    // Add the listeners corresponding to the record choices.
    recordChoicesButtons();
    // Add the listeners corresponding to the anime related content options.
    animeModalButtons();
});