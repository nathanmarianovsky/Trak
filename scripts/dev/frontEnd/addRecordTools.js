/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page.

    - navReset: Resets the top nav to correspond to the clicked category.
    - formatRunningTime: Formats a string to be in the format "XXX m" in order to represent a record runtime.
    - setFetchedImages: Updates a record's image input based upon fetched data.
    - nameAutoCompleteFunc: Initiates a call for a record's autocomplete options.
    - valueFetchFunc: Processes the fetching of a record's details by a value.
    - nameFetchFunc: Processes the fetching of a record's details by name.
    - textAreaFunc: Hides/shows a scroll for a textarea element depending on the current element height.
    - autoCompleteInit: Initializes the autocomplete object for a record name input.
    - otherGenresReset: Hides and shows the appropriate inputs on the genresModal.
    - dragInit: Initialize the dragging of related content elements on the addRecord page.
    - autoCompleteListener: Add a listener for fetched autocomplete options on the addRecord page.
    - genreFill: Checks the appropriate genres on the addRecord page for fetched data.
    - relatedContentFinisher: Initializes select tags and tooltips. Designed to be executed after all related content items have been added.
    - relatedContentListeners: Addes the appropriate event listeners to ensure that page items are highlighted only in the event that a change in the original value is detected.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Resets the top nav to correspond to the clicked category.

   - def is the div corresponding to the default message shown prior to any record category being chosen.
   - divs is the collection of page divs corresponding to the different category content.
   - links is the collection of page links corresponding to the different categories.
   - choiceDiv is the content div which should be shown for the desired category.
   - choiceLink is the link on the top nav corresponding to which category should be shown.

*/
var navReset = (def, divs, links, choiceDiv, choiceLink) => {
    // Hide the default content.
    if(def.style.display != "none") {
        def.style.display = "none";
    }
    // Hide all page content by default if the anime content is not shown.
    else if(!choiceLink.parentNode.classList.contains("active")) {
        Array.from(divs).forEach(div => div.style.display = "none");
        Array.from(links).forEach(link => link.parentNode.classList.remove("active"));
    }
    // Show the desired content and highlight the associated tab on the navbar.
    choiceLink.parentNode.classList.add("active");
    choiceDiv.style.display = "initial";
};



/*

Formats a string to be in the format "XXX m" in order to represent a record runtime.

   - str is a string representing a record's runtime.

*/
var formatRunningTime = str => String(parseInt(str)) + " m";



/*

Updates a record's image input based upon fetched data.

   - category is a string corresponding to a record category.
   - clrFav is a string representing the color to be applied for the image favorite button.
   - imgList is an array of links corresponding to record images.

*/
var setFetchedImages = (category, clrFav, imgList) => {
    // Update the recprd image, if available.
    if(imgList[1].constructor === Array && imgList[1].length > 0) {
        const recordImg = document.getElementById("addRecord" + category + "Img"),
            recordFavImgLink = document.getElementById(category.toLowerCase() + "FavoriteImageLink");
        recordImg.setAttribute("list", "");
        for(let t = 0; t < imgList[1].length; t++) {
            if(!recordImg.getAttribute("list").includes(imgList[1][t])) {
                recordImg.getAttribute("list") == "" ? recordImg.setAttribute("list", imgList[1][t]) : recordImg.setAttribute("list", recordImg.getAttribute("list") + "," + imgList[1][t]);
            }
        }
        recordImg.setAttribute("src", imgList[0]);
        recordFavImgLink.style.visibility = "visible";
        recordFavImgLink.style.color = clrFav;
    }
};



/*

Initiates a call for a record's autocomplete options.

   - category is a string corresponding to a record category.
   - tgt is a page element corresponding to the record name input.
   - prev is a string representing the previous search string.
   - objNameAutoComplete is the initialized object corresponding to the autocomplete options.
   - autoCompleteScenario is a boolean representing whether this function is being called upon a click or input event.

*/
var nameAutoCompleteFunc = (category, tgt, prev, objNameAutoComplete, autoCompleteScenario = false) => {
    // Only fetch options if the record name is of at least three characters.
    if(tgt.value.length > 2) {
        ipcRenderer.send(category.toLowerCase() + "Search", [prev, tgt.value]);
    }
    else { objNameAutoComplete.updateData({}); }
    if(autoCompleteScenario == true) {
        // Set the previous search value to the current one.
        return tgt.value;
    }
};



/*

Processes the fetching of a record's details by a value.

   - category is a string corresponding to a record category.
   - objVal is the page element corresponding to the record value input.
   - objPreloader is the page element corresponding to the primary record preloader.

*/
var valueFetchFunc = (category, objVal, objPreloader) => {
    const submissionVal = objVal.value.replace(/\W/g,"");
    if(submissionVal.length == 10) {
        objPreloader.style.visibility = "visible";
        ipcRenderer.send(category.toLowerCase() + "FetchDetailsByASIN", submissionVal);
    }
    else if(submissionVal.length == 13) {
        objPreloader.style.visibility = "visible";
        ipcRenderer.send(category.toLowerCase() + "FetchDetailsByISBN", submissionVal);
    }
    else {
        M.toast({"html": "The " + (category == "Book" ? "ISBN" : "value") + " is not valid to fetch details.", "classes": "rounded"});
    }
};



/*

Processes the fetching of a record's details by name.

   - category is a string corresponding to a record category.
   - objName is the page element corresponding to the record name/title input.
   - objPreloader is the page element corresponding to the primary record preloader.
   - extraPreloader is the page element corresponding to the secondary record preloader, if available.

*/
var nameFetchFunc = (category, objName, objPreloader, extraPreloader = null) => {
    if(objName.value.length > 2) {
        objPreloader.style.visibility = "visible";
        if(extraPreloader !== null) {
            extraPreloader.style.visibility = "visible";
        }
        ipcRenderer.send(category.toLowerCase() + "FetchDetails", objName.value);
    }
    else {
        M.toast({"html": "The name is too short to fetch details.", "classes": "rounded"});
    }
};



/*

Hides/shows a scroll for a textarea element depending on the current element height.

   - textAreaElem is the page element corresponding to the textarea whose vertical scroll is going to be hidden/shown.

*/
var textAreaFunc = textAreaElem => parseInt(textAreaElem.style.height) > parseInt(getComputedStyle(textAreaElem).maxHeight) ? textAreaElem.style.overflowY = "scroll" : textAreaElem.style.overflowY = "hidden";



/*

Initializes the autocomplete object for a record name input.

   - category is a string corresponding to a record category.
   - objName is the page element corresponding to the record name/title input.
   - objPreloader is the page element corresponding to the primary record preloader.
   - extraPreloader is the page element corresponding to the secondary record preloader, if available.

*/
var autoCompleteInit = (category, objName, objPreloader, extraPreloader = null) => {
    return M.Autocomplete.init(objName, {
        "sortFunction": (a, b) => a.localeCompare(b),
        "onAutocomplete": txt => {
            objPreloader.style.visibility = "visible";
            if(extraPreloader !== null) {
                extraPreloader.style.visibility = "visible";
            }
            ipcRenderer.send(category.toLowerCase() + "FetchDetails", txt);
        }
    });
};



/*

Hides and shows the appropriate inputs on the genresModal.

   - category is a string corresponding to a record category.

*/
var otherGenresReset = category => {
    Array.from(document.getElementsByClassName("otherGenresDiv")).forEach(div => div.style.display = "none");
    document.getElementById(category.toLowerCase() + "OtherGenresDiv").style.display = "block";
};



/*

Initialize the dragging of related content elements on the addRecord page.

   - category is a string corresponding to a record category.

*/
var dragInit = category => {
    let drake = dragula({"containers": [document.querySelector("#" + category.toLowerCase() + "List")]});
    drake.on("dragend", () => { window[category.toLowerCase() + "ListReorganize"](); });
};



/*

Add a listener for fetched autocomplete options on the addRecord page.

   - category is a string corresponding to a record category.
   - objName is the page element corresponding to the record name/title input.
   - objNameUL is the page unordered list associated to the autocomplete options.
   - nameAutoComplete is the initialized object corresponding to the autocomplete options.

*/
var autoCompleteListener = (category, objName, objNameUL, nameAutoComplete) => {
    // Once the autocomplete options have been attained update the page accordingly.
    ipcRenderer.on(category.toLowerCase() + "SearchResults", (event, response) => {
        // Proceed only if there are options available for autocomplete.
        if(response[2].length > 0) {
            // Define the object which will be used to update the autocomplete options.
            let autoObj = {};
            // Set the max character count based on the width of the page record name input.
            let maxCharCount = Math.floor(((20/190) * (objName.getBoundingClientRect().width - 467)) + 38);
            // Iterate through all attained autocomplete options.
            for(let t = 0; t < response[2].length; t++) {
                // Add each option to the autocomplete object.
                autoObj[response[2][t][0]] = response[2][t][1];
            }
            // Update the page autocomplete options.
            nameAutoComplete.updateData(autoObj);
            // In the case where the user is going from two to three characters, a refocus is necessary to make the unordered list for the autocomplete options to function properly.
            if(response[0].length == 2 && response[1].length == 3) {
                objNameUL.style.display = "none";
                objName.click();
                setTimeout(() => { objName.click(); objNameUL.style.display = "block"; }, 100);
            }
            // After a delay the list items for autocomplete options are provided the associated information in order to attain details upon a click.
            setTimeout(() => {
                // Iterate through all page autocomplete options.
                for(let u = 0; u < objNameUL.children.length; u++) {
                    // Attach the record name for each list item of the autocomplete options.
                    let curChild = objNameUL.children[u];
                    for(let v = 0; v < response[2].length; v++) {
                        if(curChild.children[0].getAttribute("src") == response[2][v][1]) {
                            curChild.setAttribute("name", response[2][v][0]);
                        }
                    }
                }
            }, 500);
        }
        // If the record name is not long enough then update the page autocomplete options to be empty.
        else { nameAutoComplete.updateData({}); }
    });
};



/*

Checks the appropriate genres on the addRecord page for fetched data.

   - category is a string corresponding to a record category.
   - list is an array of strings corresponding to genres.

*/
var genreFill = (category, list) => {
    if(list.constructor === Array && list.length > 0) {
        // Reset all anime genres to not be checked.
        const extraGenres = document.getElementById(category.toLowerCase() + "OtherGenres");
        extraGenres.value = "";
        Array.from(document.querySelectorAll("#category" + category + "Div .genreRow .filled-in")).forEach(inp => inp.checked = false);
        // Iterate through the fetched list of genres and check them off on the page if available.
        list.sort((a, b) => a.localeCompare(b));
        list.forEach(genreItem => {
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
            if(document.getElementById(category.toLowerCase() + "Genre" + genreIter) != undefined) {
                document.getElementById(category.toLowerCase() + "Genre" + genreIter).checked = true;
            }
            else {
                extraGenres.value == "" ? extraGenres.value = genreIter : extraGenres.value += ", " + genreIter;
            }
        });
        if(extraGenres.value != "") {
            extraGenres.classList.add("valid");
            extraGenres.nextElementSibling.classList.add("active");
        }
        else {
            extraGenres.classList.remove("valid");
            extraGenres.nextElementSibling.classList.remove("active");
        }
    }
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