/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on manga records.

    - mangaSave: Processes the information required to save a manga record.
    - mangaModalButtons: Listen for click events on the related content manga modal buttons.
    - resetMangaContentCounters: Resets the page counters for a manga record's related content.
    - calculateMangaRating: Calculates the average rating for a manga based on the available ratings for all chapters and volumes.
    - mangaListReorganize: Reorganize the list items in the associated manga modal.
    - mangaContentSingleButtons: Listen for click events on the related content manga chapter/volume table items.
    - mangaItemAddition: Driver function designed to add a chapter/volume table item in the related content section of a manga record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Processes the information required to save a manga record.

*/
var mangaSave = () => {
    // Define the page save button.
    const mangaSaveBtn = document.getElementById("mangaSave");
    // Listen for a click on the save button.
    mangaSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const mangaList = document.getElementById("mangaList"),
            mangaName = document.getElementById("mangaName").value,
            mangaJapaneseName = document.getElementById("mangaJapaneseName").value,
            mangaReview = document.getElementById("mangaReview").value,
            mangaPublisher = document.getElementById("mangaPublisher").value,
            mangaJapanesePublisher = document.getElementById("mangaJapanesePublisher").value,
            mangaWriters = document.getElementById("mangaWriters").value,
            mangaIllustrator = document.getElementById("mangaIllustrator").value,
            mangaDemographic = document.getElementById("mangaDemographic").value,
            mangaStart = document.getElementById("mangaStartDate").value,
            mangaEnd = document.getElementById("mangaEndDate").value,
            mangaSynopsis = document.getElementById("mangaSynopsis").value,
            mangaImg = document.getElementById("addRecordMangaImg").getAttribute("list").split(","),
            mangaFiles = Array.from(document.getElementById("mangaAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("mangaOtherGenres").value.split(",").map(elem => elem.trim()),
            genresLst = genreList("Manga"),
            genres = [],
            content = [];
        // Check to see that at least one name was provided.
        if(mangaName != "" || mangaJapaneseName != "") {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("mangaGenre" + genresLst[p]).checked);
            }
            // For each table item in the related content table process the associated information.
            for(let q = 1; q < mangaList.children.length + 1; q++) {
                let mangaListChild = mangaList.children[q - 1],
                    mangaListChildCondition = mangaListChild.id.split("_")[2],
                    curContent = [];
                // Define the related content details.
                let singleName = document.getElementById("li_" + q + "_" + mangaListChildCondition + "_Name").value,
                    singleRelease = document.getElementById("li_" + q + "_" + mangaListChildCondition + "_Release").value,
                    singleLastRead = document.getElementById("li_" + q + "_" + mangaListChildCondition + "_LastRead").value,
                    singleRating = document.getElementById("li_" + q + "_" + mangaListChildCondition + "_Rating").value,
                    singleReview = document.getElementById("li_" + q + "_" + mangaListChildCondition + "_Review").value;
                // Push the related content item details into a collection.
                if(mangaListChildCondition == "Chapter") {
                    curContent.push("Chapter", singleName, singleRelease, singleLastRead, singleRating, singleReview);
                }
                else if(mangaListChildCondition == "Volume") {
                    let singleISBN = document.getElementById("li_" + q + "_Volume_ISBN").value.replace(/-/g, ""),
                        singleSynopsis = document.getElementById("li_" + q + "_Volume_Synopsis").value;
                    curContent.push("Volume", singleName, singleRelease, singleLastRead, singleRating, singleReview, singleISBN, singleSynopsis);
                }
                // Push the table item information into the array holding all related content details.
                content.push(curContent);
            }
            const ogName = document.getElementById("mangaName").getAttribute("oldName"),
                oldTitle = ogName !== null ? ogName : mangaName;
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Manga", mangaName, mangaJapaneseName, mangaReview, mangaWriters, mangaIllustrator, mangaPublisher, mangaJapanesePublisher,
                mangaDemographic, mangaStart, mangaFiles, mangaEnd, content, [genresLst, genres, otherGenres], mangaSynopsis,
                [document.getElementById("addRecordMangaImg").getAttribute("list") == document.getElementById("addRecordMangaImg").getAttribute("previous"), mangaImg], oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "A manga record requires that a name be provided.", "classes": "rounded"}); }
    });
};



/*

Listen for click events on the related content manga modal buttons.

*/
var mangaModalButtons = () => {
    // Define the buttons for all actions.
    const mangaAddVolume = document.getElementById("mangaAddVolume"),
        mangaAddChapter = document.getElementById("mangaAddChapter"),
        mangaModalSwitch = document.getElementById("mangaModalSwitch"),
        mangaList = document.getElementById("mangaList");
    // Listen for a change in the related content type to change the content accordingly.
    const originalSwitchBackground = "#00000061",
        newSwitchBackground = "#" + addAlpha(rgba2hex(getComputedStyle(mangaAddVolume).backgroundColor).substring(1), 0.6);
    mangaModalSwitch.addEventListener("change", e => {
        if(e.target.checked == true) {
            mangaAddVolume.style.display = "none";
            mangaAddChapter.style.display = "inline-block";
            Array.from(mangaList.children).forEach(li => li.style.display = (li.getAttribute("id").split("_")[2] == "Chapter" ? "list-item" : "none"));
            document.querySelector("#mangaModalSwitchDiv label input[type=checkbox]:checked+.lever").style.backgroundColor = newSwitchBackground;
        }
        else {
            mangaAddVolume.style.display = "inline-block";
            mangaAddChapter.style.display = "none";
            Array.from(mangaList.children).forEach(li => li.style.display = (li.getAttribute("id").split("_")[2] == "Volume" ? "list-item" : "none"));
            document.querySelector("#mangaModalSwitchDiv label .lever").style.backgroundColor = originalSwitchBackground;
        }
    });
    // Listen for a click event on the manga related content chapter creation button.
    mangaAddChapter.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new chapter.
        clearTooltips();
        mangaItemAddition("Chapter");
        relatedContentFinisher();
        resetMangaContentCounters();
    });
    // Listen for a click event on the manga related content volume creation button.
    mangaAddVolume.addEventListener("click", e => {
        e.preventDefault();
        // Add a table item for the new volume.
        clearTooltips();
        mangaItemAddition("Volume");
        relatedContentFinisher();
        resetMangaContentCounters();
    });
};



/*

Resets the page counters for a manga record's related content.

*/
var resetMangaContentCounters = () => {
    const itemList = Array.from(document.getElementById("mangaList").children),
        mangaChapterCount = document.getElementById("mangaChapterCount"),
        mangaVolumeCount = document.getElementById("mangaVolumeCount");
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
    counterAssignment(mangaChapterCount, chapterCount);
    counterAssignment(mangaVolumeCount, volumeCount);
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