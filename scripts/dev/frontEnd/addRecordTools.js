/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page.

    - counterAssignment: Updates a record counter on the addRecord page associated a record's related content.
    - updateFetchedDataString: Updates a page text input.
    - updateFetchedDataTextArea: Updates a page textarea input.
    - updateFetchedDataDate: Updates a page date input.
    - imgButtons: Adds the functionality for all image buttons based on the category currently chosen.
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



var updateGenreLoad = (category, otherGenres, genreData) => {
    for(let v = 0; v < genreData[0].length; v++) {
        document.getElementById(category.toLowerCase() + "Genre" + genreData[0][v]).checked = genreData[1][v];
    }
    let otherGenresDiv = document.getElementById(category.toLowerCase() + "OtherGenresDiv");
    otherGenresDiv.style.display = "block";
    otherGenres.value = genreData[2].join(", ");
    if(otherGenres.value.trim() != "") { otherGenres.nextElementSibling.classList.add("active"); }
    otherGenres.setAttribute("lastValue", genreData[2].join(", "));
};



var updateImgLoad = (category, imgElem, imgData) => {
    imgElem.setAttribute("list", imgData.join(","));
    imgElem.setAttribute("previous", imgData.join(","));
    imgElem.setAttribute("src", imgData.length > 0 && imgData[0] != "" ? imgData[0] : imgElem.getAttribute("default"));
    const favImgLink = document.getElementById(category.toLowerCase() + "FavoriteImageLink");
    if(!imgElem.getAttribute("src").includes("imgDef.png")) {
        favImgLink.style.visibility = "visible";
    }
    favImgLink.style.color = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
};



/*

Updates a record counter on the addRecord page associated a record's related content.

   - elem is the page element corresponding to a text input.
   - counter is an integer corresponding to the number of items available in the record's related content of the input's specific type.

*/
var counterAssignment = (elem, counter) => {
    elem.value = counter;
    counter > 0 ? elem.classList.add("valid") : elem.classList.remove("valid");
};



/*

Updates a page text input.

   - elem is the page element corresponding to a text input.
   - data is the string representing the value of the text input.
   - updateCheck is a boolean representing whether the data is being provided for a record's creation or update.
   - nameCheck is a boolean representing whether the text input corresponds to a name input for which there is an autocomplete portion attached.
   - callback is a function meant to be called after updating the text input.

*/
var updateFetchedDataString = (elem, data, updateCheck, nameCheck = false, callback) => {
    // Update the record data if available.
    if(data !== null && data.trim() != ""  && data != "None found, add some") {
        if(updateCheck == true) {
            elem.value += (elem.value.trim() == "" ? data : ", " + data);
            elem.setAttribute("lastValue", elem.value);
        }
        else {
            elem.value = data;
        }
        // updateCheck == true ? elem.value += (elem.value == "" ? data : ", " + data) : elem.value = data;
        elem.classList.add("valid");
        if(nameCheck == true) {
            elem.nextElementSibling.nextElementSibling.classList.add("active");
        }
        else if(elem.nextElementSibling !== null) {
            elem.nextElementSibling.classList.add("active");
        }
    }
    else {
        elem.value = "";
        elem.classList.remove("valid");
        if(nameCheck == true) {
            elem.nextElementSibling.nextElementSibling.classList.remove("active");
        }
        else if(elem.nextElementSibling !== null) {
            elem.nextElementSibling.classList.remove("active");
        }
    }
    if(callback) { callback(elem); }
};



/*

Updates a page textarea input.

   - elem is the page element corresponding to a textarea input.
   - data is the string representing the value of the textarea input.
   - updateCheck is a boolean representing whether the data is being provided for a record's creation or update.

*/
var updateFetchedDataTextArea = (elem, data, updateCheck) => {
    if(data !== null && data.trim() != "" && data != "None found, add some") {
        let textHolder = data.replace("[Written by MAL Rewrite]", "");
        if(textHolder.includes("(Source:")) {
            textHolder = textHolder.substring(0, textHolder.indexOf("(Source:"));
        }
        elem.value = textHolder.trim();
        elem.classList.add("valid");
        elem.nextElementSibling.classList.add("active");
        if(updateCheck == true) {
            elem.setAttribute("lastValue", elem.value);
        }
    }
    else {
        elem.value = "";
        elem.classList.remove("valid");
        elem.nextElementSibling.classList.remove("active");
    }
    M.textareaAutoResize(elem);
};



/*

Updates a page date input.

   - elem is the page element corresponding to a date input.
   - data is the string representing the value of the date input.
   - updateCheck is a boolean representing whether the data is being provided for a record's creation or update.

*/
var updateFetchedDataDate = (elem, data, updateCheck) => {
    if(data !== null && data.trim() != "" && data != " ?") {
        elem.value = new Date(data).toISOString().split("T")[0];
        elem.classList.add("valid");
        if(updateCheck == true) {
            elem.setAttribute("lastValue", elem.value);
        }
    }
    else {
        elem.value = "";
        elem.classList.remove("valid");
    }
};



/*

Adds the functionality for all image buttons based on the category currently chosen.

   - favLink is the link corresponding to the favorite image button.
   - prevBtn is the button corresponding to the previous image.
   - addBtn is the button corresponding to the action of adding an image.
   - addInput is the input activated on the click of the add button.
   - remBtn is the button corresponding to the action of removing an image.
   - nextBtn is the button corresponding to the next image.
   - recordImg is the image tag associated to the currently selected record category.
   - favColor is the application's primary color.

*/
var imgButtons = (favLink, prevBtn, addBtn, addInput, remBtn, nextBtn, recordImg, favColor) => {
    // Define the default color which will be applied to the favorite image icon.
    const btnColorDefault = newSwitchBackground = "#" + addAlpha(rgba2hex(getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor).substring(1), 0.4);
    // Listen for a click event on the favorite image button in order to redefine the favorite image for a record.
    favLink.addEventListener("click", e => {
        if(rgba2hex(favLink.style.color) == btnColorDefault) {
            let imgArr = recordImg.getAttribute("list").split(","),
                imgArrIndex = imgArr.indexOf(recordImg.getAttribute("src"));
            arrayMove(imgArr, imgArrIndex, 0);
            recordImg.setAttribute("list", imgArr.join(","));
            favLink.style.color = favColor;
            favLink.style.cursor = "initial";
        }
    });
    // Listen for a click event on the previous image button.
    prevBtn.addEventListener("click", e => {
        let curListArr = recordImg.getAttribute("list").split(","),
            index = curListArr.indexOf(recordImg.getAttribute("src"));
        // Change the image source to the previous one in the list, wrapping around if necessary.
        if(curListArr.length > 1) {
            recordImg.setAttribute("src", index == 0 ? curListArr[curListArr.length - 1] : curListArr[index - 1]);
            if(curListArr[0] == (index == 0 ? curListArr[curListArr.length - 1] : curListArr[index - 1])) {
                favLink.style.color = favColor;
                favLink.style.cursor = "initial";
            }
            else {
                favLink.style.color = btnColorDefault;
                favLink.style.cursor = "pointer";
            }
        }
    });
    // Listen for a click event on the add image button.
    addBtn.addEventListener("click", e => { addInput.click(); });
    // Listen for a submission on the add image input.
    addInput.addEventListener("change", e => {
        let curList = recordImg.getAttribute("list"),
            newList = Array.from(e.target.files),
            newStr = curList;
        // Iterate through the submitted files and add them to the list if they are not already included.
        newList.forEach(fle => {
            if(newStr == "") {
                recordImg.setAttribute("src", fle.path);
                newStr = fle.path;
            }
            else if(!curList.includes(fle.path)) {
                newStr += "," + fle.path;
            }
        });
        recordImg.setAttribute("list", newStr);
        favLink.style.visibility = "visible";
        favLink.click();
    });
    // Listen for a click event on the remove image button.
    remBtn.addEventListener("click", e => {
        let curListArr = recordImg.getAttribute("list").split(","),
            remItem = recordImg.getAttribute("src"),
            index = curListArr.indexOf(remItem),
            next = "";
        if(curListArr.length > 0) {
            // If the list of images has more than one image then set the current image to the next one.
            if(curListArr.length > 1) {
                if(index == curListArr.length - 1) { next = curListArr[0]; }
                else { next = curListArr[index + 1]; }
                recordImg.setAttribute("src", next);
            }
            // If the list of images only has the image about to be deleted then set the current image to the default one.
            else {
                recordImg.setAttribute("src", recordImg.getAttribute("default"));
                favLink.style.visibility = "hidden";
            }
            // Remove the image from the list.
            curListArr.splice(index, 1);
            recordImg.setAttribute("list", curListArr.join(","));
            if(curListArr[0] == recordImg.getAttribute("src")) {
                favLink.style.color = favColor;
                favLink.style.cursor = "initial";
            }
            else {
                favLink.style.color = btnColorDefault;
                favLink.style.cursor = "pointer";
            }
        }
    });
    // Listen for a click event on the next image button.
    nextBtn.addEventListener("click", e => {
        let curListArr = recordImg.getAttribute("list").split(","),
            index = curListArr.indexOf(recordImg.getAttribute("src"));
        // Change the image source to the previous one in the list, wrapping around if necessary.
        if(curListArr.length > 1) {
            recordImg.setAttribute("src", index == curListArr.length - 1 ? curListArr[0] : curListArr[index + 1]);
            if(curListArr[0] == (index == curListArr.length - 1 ? curListArr[0] : curListArr[index + 1])) {
                favLink.style.color = favColor;
                favLink.style.cursor = "initial";
            }
            else {
                favLink.style.color = btnColorDefault;
                favLink.style.cursor = "pointer";
            }
        }
    });
};



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



/*

Creates an association listing in the notifications modal.

   - itemId is a string corresponding to the id of a record.
   - itemCategory is a string corresponding to the category of a record.
   - itemTitle is a string corresponding to the name of a record.
   - itemImg is a string corresponding to the image of a record.

*/
var associationCreation = (itemId, itemCategory, itemTitle, itemImg) => {
    // Define the portions of the association listed item.
    const outerLI = document.createElement("li"),
        img = document.createElement("img"),
        imgIcon = document.createElement("i"),
        span = document.createElement("span"),
        par = document.createElement("p"),
        link = document.createElement("a"),
        linkIcon = document.createElement("i");
    // Modify the notification components appropriately.
    outerLI.classList.add("collection-item", "avatar");
    outerLI.setAttribute("associationId", itemId);
    outerLI.setAttribute("associationCategory", itemCategory);
    outerLI.setAttribute("associationTitle", itemTitle);
    img.setAttribute("src", itemImg);
    img.classList.add("circle");
    imgIcon.classList.add("material-icons", "circle");
    imgIcon.textContent = "bookmark";
    span.classList.add("title", "recordsNameRowDiv", "associationTitle");
    span.textContent = itemTitle;
    span.setAttribute("id", itemId);
    par.innerHTML = itemCategory;
    link.classList.add("secondary-content");
    linkIcon.classList.add("material-icons", "associationDelete");
    linkIcon.textContent = "close";
    link.append(linkIcon);
    // Attach the association to the associations modal.
    outerLI.append(itemImg != "" ? img : imgIcon, span, par, link);
    document.getElementById("associationsCollection").append(outerLI);
};



/*

Adds the listeners associated to an association listing.

   - ipcElec provides the means to operate the Electron app.

*/
var associationsListeners = ipcElec => {
    // Listen for a click on the name of an association in order to open the update page.
    Array.from(document.getElementsByClassName("associationTitle")).forEach(itemLink => {
        itemLink.addEventListener("click", e => {
            e.preventDefault();
            ipcElec.send("updateRecord", e.target.id);
        });
    });
    // Listen for a click on the delete icon of an association in order to remove the association.
    Array.from(document.getElementsByClassName("associationDelete")).forEach(itemLink => {
        itemLink.addEventListener("click", e => {
            e.target.closest("li").remove();
        });
    });
};



var saveAssociations = (curCategory, curName, ipcElec) => {
    ipcElec.send("saveAssociations", [curCategory, curName, Array.from(document.getElementById("associationsCollection").children).map(association => association.getAttribute("associationId"))]);
};