/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

    - navReset: Resets the top nav to correspond to the clicked category.
    - imgButtons: Adds the functionality for all image buttons based on the category currently chosen.
    - animeModalButtons: Listen for click events on the related content anime modal buttons.
    - animeSave: Processes the information required to save an anime record.
    - recordChoicesButtons: Listen for click events on the record choices.

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
            else { recordImg.setAttribute("src", recordImg.getAttribute("default")); }
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
            animeSynopsis = document.getElementById("animeSynopsis").value,
            animeImg = document.getElementById("addRecordAnimeImg").getAttribute("list").split(","),
            animeFiles = Array.from(document.getElementById("animeAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("otherGenres").value.split(",").map(elem => elem.trim()),
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
            const submissionMaterial = ["Anime", animeName, animeJapaneseName, animeReview, animeDirectors, animeProducers, animeWriters,
                animeMusicians, animeStudio, animeLicense, animeFiles, [genresLst, genres, otherGenres], content, animeSynopsis,
                [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), animeImg], oldTitle];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no name has been provided then notify the user.
        else { M.toast({"html": "An anime record requires that either an English or Japanese name is provided.", "classes": "rounded"}); }
    });
};



/*

Listen for click events on the record choices.

*/
var recordChoicesButtons = () => {
    // Define the buttons for all record choices.
    const categoryAnime = document.getElementById("categoryAnime"),
        categoryBook = document.getElementById("categoryBook");
    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryLinks = document.getElementsByClassName("categoryLink"),
        categoryInitial = document.getElementById("categoryInitial"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv"),
        categoryBookDiv = document.getElementById("categoryBookDiv");
    // Define the color which will be applied to the favorite image icon.
    const btnColorFavorite = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
    let introHolder = false;
    ipcRenderer.on("addIntroduction", event => introHolder = true);










    categoryBook.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryBookDiv, categoryBook);
        // Define all image buttons.
        const bookPreviousImgBtn = document.getElementById("bookPreviousImgBtn"),
            bookAddImgBtn = document.getElementById("bookAddImgBtn"),
            bookAddImgInput = document.getElementById("bookAddImgInput"),
            bookRemoveImgBtn = document.getElementById("bookRemoveImgBtn"),
            bookNextImgBtn = document.getElementById("bookNextImgBtn"),
            addRecordBookImg = document.getElementById("addRecordBookImg"),
            bookFavoriteImageLink = document.getElementById("bookFavoriteImageLink");
        imgButtons(bookFavoriteImageLink, bookPreviousImgBtn, bookAddImgBtn, bookAddImgInput, bookRemoveImgBtn, bookNextImgBtn, addRecordBookImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const bookTitle = document.getElementById("bookTitle"),
            bookISBN = document.getElementById("bookISBN"),
            bookTitleAutocomplete = M.Autocomplete.init(bookTitle, {
                "sortFunction": (a, b) => a.localeCompare(b),
                "onAutocomplete": txt => {
                    bookPreloader.style.visibility = "visible";
                    ipcRenderer.send("bookFetchDetailsByName", txt);
                }
            }),
            bookTitleUL = bookTitle.nextElementSibling,
            bookPreloader = document.getElementById("bookPreloader"),
            bookFetchBtn = document.getElementById("bookFetchDetailsBtn"),
            bookSave = document.getElementById("bookSave");
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        bookFetchBtn.addEventListener("click", e => {
            if(bookISBN.value.length == 13) {
                bookPreloader.style.visibility = "visible";
                ipcRenderer.send("bookFetchDetails", bookISBN.value);
            }
            else {
                M.toast({"html": "The provided ISBN is not valid to fetch details from GoodReads", "classes": "rounded"});
            }
        });
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "",
            maxCharCount = 0;
        // Listen for an input change in the book title in order to fetch autocomplete options from goodreads.
        bookTitle.addEventListener("input", e => {
            // Only fetch goodreads options if the book title is of at least three characters.
            if(e.target.value.length > 2) {
                ipcRenderer.send("bookSearch", [previousName, e.target.value]);
            }
            else { bookTitleAutocomplete.updateData({}); }
            // Set the previous search value to the current one.
            previousName = e.target.value;
        });
        // Listen for a click event on the book title in order to trigger a fetch of autocomplete options from goodreads.
        bookTitle.addEventListener("click", e => {
            // Only fetch goodreads options if the book title is of at least three characters.
            if(e.target.value.length > 2) {
                ipcRenderer.send("bookSearch", [previousName, e.target.value]);
            }
            else { bookTitleAutocomplete.updateData({}); }
        });
        // Once the autocomplete options have been attained update the page accordingly.
        ipcRenderer.on("bookSearchResults", (event, response) => {
            // Proceed only if there are options available for autocomplete.
            if(response[2].length > 0) {
                // Define the object which will be used to update the autocomplete options.
                let autoObj = {};
                // Set the max character count based on the width of the page book title input.
                maxCharCount = Math.floor(((20/190) * (bookTitle.getBoundingClientRect().width - 467)) + 38);
                // Iterate through all attained autocomplete options.
                for(let t = 0; t < response[2].length; t++) {
                    // Add each option to the autocomplete object.
                    autoObj[response[2][t][0]] = response[2][t][1];
                }
                // Update the page autocomplete options.
                bookTitleAutocomplete.updateData(autoObj);
                // In the case where the user is going from two to three characters, a refocus is necessary to make the unordered list for the autocomplete options to function properly.
                if(response[0].length == 2 && response[1].length == 3) {
                    bookTitleUL.style.display = "none";
                    bookTitle.click();
                    setTimeout(() => { bookTitle.click(); bookTitleUL.style.display = "block"; }, 100);
                }
                // After a delay the list items for autocomplete options are provided the associated information in order to attain details upon a click.
                setTimeout(() => {
                    // Iterate through all page autocomplete options.
                    for(let u = 0; u < bookTitleUL.children.length; u++) {
                        // Attach the book title for each list item of the autocomplete options.
                        let curChild = bookTitleUL.children[u];
                        for(let v = 0; v < response[2].length; v++) {
                            if(curChild.children[0].getAttribute("src") == response[2][v][1]) {
                                curChild.setAttribute("name", response[2][v][0]);
                            }
                        }
                    }
                }, 500);
            }
            // If the book title is not long enough then update the page autocomplete options to be empty.
            else { bookTitleAutocomplete.updateData({}); }
        });
        // Update the page accordingly based on the fetched book details.
        ipcRenderer.on("bookFetchDetailsByNameResult", (newEve, newResponse) => {
            console.log(newResponse);
            if(newResponse[2] !== null) {
                const bookImg = document.getElementById("addRecordBookImg"),
                    bookFavImgLink = document.getElementById("bookFavoriteImageLink");
                bookImg.setAttribute("list", newResponse[2]);
                bookImg.setAttribute("src", newResponse[2]);
                bookFavImgLink.style.visibility = "visible";
                bookFavImgLink.style.color = btnColorFavorite;
            }
            if(newResponse[3] !== null) {
                const bookISBN = document.getElementById("bookISBN");
                bookISBN.value = newResponse[3];
                if(newResponse[3] != "") {
                    bookISBN.classList.add("valid");
                    bookISBN.nextElementSibling.classList.add("active");
                }
                else {
                    bookISBN.classList.remove("valid");
                    bookISBN.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookISBN.value = "";
                bookISBN.classList.remove("valid");
                bookISBN.nextElementSibling.classList.remove("active");
            }
            if(newResponse[4] !== null) {
                const bookAuthor = document.getElementById("bookAuthor");
                bookAuthor.value = newResponse[4];
                if(newResponse[4] != "") {
                    bookAuthor.classList.add("valid");
                    bookAuthor.nextElementSibling.classList.add("active");
                }
                else {
                    bookAuthor.classList.remove("valid");
                    bookAuthor.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookAuthor.value = "";
                bookAuthor.classList.remove("valid");
                bookAuthor.nextElementSibling.classList.remove("active");
            }
            if(newResponse[5] !== null) {
                const bookPublisher = document.getElementById("bookPublisher");
                bookPublisher.value = newResponse[5];
                if(newResponse[5] != "") {
                    bookPublisher.classList.add("valid");
                    bookPublisher.nextElementSibling.classList.add("active");
                }
                else {
                    bookPublisher.classList.remove("valid");
                    bookPublisher.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookAuthor.value = "";
                bookAuthor.classList.remove("valid");
                bookAuthor.nextElementSibling.classList.remove("active");
            }
            if(newResponse[6] !== null) {
                const bookPublicationYear = document.getElementById("bookPublicationYear");
                bookPublicationYear.value = newResponse[6];
                if(newResponse[6] != "") {
                    bookPublicationYear.classList.add("valid");
                    bookPublicationYear.nextElementSibling.classList.add("active");
                }
                else {
                    bookPublicationYear.classList.remove("valid");
                    bookPublicationYear.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookPublicationYear.value = "";
                bookPublicationYear.classList.remove("valid");
                bookPublicationYear.nextElementSibling.classList.remove("active");
            }
            if(newResponse[7] !== null) {
                const bookPages = document.getElementById("bookPages");
                bookPages.value = newResponse[7];
                if(newResponse[7] != "") {
                    bookPages.classList.add("valid");
                    bookPages.nextElementSibling.classList.add("active");
                }
                else {
                    bookPages.classList.remove("valid");
                    bookPages.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookPages.value = "";
                bookPages.classList.remove("valid");
                bookPages.nextElementSibling.classList.remove("active");
            }
            if(newResponse[8] !== null) {
                const bookMediaType = document.getElementById("bookMediaType");
                if(newResponse[8].includes("Hardcover")) {
                    bookMediaType.value = "hardcover";
                }
                else if(newResponse[8].includes("Softcover")) {
                    bookMediaType.value = "softcover";
                }
                else {
                    bookMediaType.value = "audiobook";
                }
            }
            if(newResponse[9] !== null) {
                const bookSynopsis = document.getElementById("bookSynopsis");
                bookSynopsis.value = newResponse[9];
                if(newResponse[9] != "") {
                    bookSynopsis.classList.add("valid");
                    bookSynopsis.nextElementSibling.classList.add("active");
                }
                else {
                    bookSynopsis.classList.remove("valid");
                    bookSynopsis.nextElementSibling.classList.remove("active");
                }
                M.textareaAutoResize(bookSynopsis);
            }
            else {
                bookSynopsis.value = "";
                bookSynopsis.classList.remove("valid");
                bookSynopsis.nextElementSibling.classList.remove("active");
            }
            if(newResponse[10] !== null) {
                // Reset all anime genres to not be checked.
                const extraGenres = document.getElementById("otherGenres");
                extraGenres.value = "";
                Array.from(document.querySelectorAll(".genreRow .filled-in")).forEach(inp => inp.checked = false);
                // Iterate through the fetched list of genres and check them off on the page if available.
                newResponse[10].sort((a, b) => a.localeCompare(b));
                newResponse[10].forEach(genreItem => {
                    let genreIter = genreItem;
                    if(genreIter == "Sci-Fi") {
                        genreIter = "SciFi";
                    }
                    if(document.getElementById("animeGenre" + genreIter) != undefined) {
                        document.getElementById("animeGenre" + genreIter).checked = true;
                    }
                    else {
                        extraGenres.value == "" ? extraGenres.value = genreIter : extraGenres.value += ", " + genreIter;
                    }
                });
                extraGenres.value != "" ? extraGenres.nextElementSibling.classList.add("active") : extraGenres.nextElementSibling.classList.remove("active");
            }
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            bookPreloader.style.visibility = "hidden";
            bookFetchBtn.style.visibility = "visible";
            bookSave.style.visibility = "visible";
            initSelect();
        });
    });










    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryAnimeDiv, categoryAnime);
        // Initialize the dragging of the related content.
        let drake = dragula({"containers": [document.querySelector('#animeList')]});
        drake.on("dragend", () => { animeListReorganize(); });
        // Define all image buttons.
        const animePreviousImgBtn = document.getElementById("animePreviousImgBtn"),
            animeAddImgBtn = document.getElementById("animeAddImgBtn"),
            animeAddImgInput = document.getElementById("animeAddImgInput"),
            animeRemoveImgBtn = document.getElementById("animeRemoveImgBtn"),
            animeNextImgBtn = document.getElementById("animeNextImgBtn"),
            addRecordAnimeImg = document.getElementById("addRecordAnimeImg"),
            animeFavoriteImageLink = document.getElementById("animeFavoriteImageLink");
        imgButtons(animeFavoriteImageLink, animePreviousImgBtn, animeAddImgBtn, animeAddImgInput, animeRemoveImgBtn, animeNextImgBtn, addRecordAnimeImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const animeName = document.getElementById("animeName"),
            animeNameAutocomplete = M.Autocomplete.init(animeName, {
                "sortFunction": (a, b) => a.localeCompare(b),
                "onAutocomplete": txt => {
                    animePreloader.style.visibility = "visible";
                    ipcRenderer.send("animeFetchDetails", txt);
                }
            }),
            animeNameUL = animeName.nextElementSibling,
            animePreloader = document.getElementById("animePreloader"),
            animeMoreBtn = document.getElementById("animeMoreDetailsBtn"),
            animeFetchBtn = document.getElementById("animeFetchDetailsBtn"),
            animeSave = document.getElementById("animeSave"),
            animeOptions = document.getElementById("animeOptions");
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        animeFetchBtn.addEventListener("click", e => {
            if(animeName.value.length > 2) {
                animePreloader.style.visibility = "visible";
                ipcRenderer.send("animeFetchDetails", animeName.value);
            }
            else {
                M.toast({"html": "The name is too short to fetch details from MyAnimeList", "classes": "rounded"});
            }
        });
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
                    // Add each option to the autocomplete object.
                    autoObj[response[2][t][0]] = response[2][t][1];
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
                        // Attach the anime name for each list item of the autocomplete options.
                        let curChild = animeNameUL.children[u];
                        for(let v = 0; v < response[2].length; v++) {
                            if(curChild.children[0].getAttribute("src") == response[2][v][1]) {
                                curChild.setAttribute("name", response[2][v][0]);
                            }
                        }
                    }
                }, 500);
            }
            // If the anime name is not long enough then update the page autocomplete options to be empty.
            else { animeNameAutocomplete.updateData({}); }
        });
        // Update the page accordingly based on the fetched anime details.
        ipcRenderer.on("animeFetchDetailsResult", (newEve, newResponse) => {
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none";
            // Update the anime japanese name if available.
            if(newResponse[1] != "" && newResponse[1] != "None found, add some") {
                const jnameInput = document.getElementById("animeJapaneseName");
                updateDetector == true ? jnameInput.value += newResponse[1] : jnameInput.value = newResponse[1];
                jnameInput.value = newResponse[1];
                jnameInput.classList.add("valid");
                jnameInput.nextElementSibling.classList.add("active");
            }
            // Update the anime image if available.
            if(newResponse[2][1].length > 0) {
                const animeImg = document.getElementById("addRecordAnimeImg"),
                    animeFavImgLink = document.getElementById("animeFavoriteImageLink");
                animeImg.setAttribute("list", "");
                for(let t = 0; t < newResponse[2][1].length; t++) {
                    if(!animeImg.getAttribute("list").includes(newResponse[2][1][t])) {
                        animeImg.getAttribute("list") == "" ? animeImg.setAttribute("list", newResponse[2][1][t]) : animeImg.setAttribute("list", animeImg.getAttribute("list") + "," + newResponse[2][1][t]);
                    }
                }
                animeImg.setAttribute("src", newResponse[2][0]);
                animeFavImgLink.style.visibility = "visible";
                animeFavImgLink.style.color = btnColorFavorite;
            }
            // Update the anime studios if available.
            if(newResponse[8] != "" && newResponse[8] != "None found, add some") {
                const studioInput = document.getElementById("animeStudio");
                updateDetector == true ? studioInput.value += (studioInput.value == "" ? newResponse[8] : ", " + newResponse[8]) : studioInput.value = newResponse[8];
                studioInput.classList.add("valid");
                studioInput.nextElementSibling.classList.add("active");
            }
            // Update the anime directors if available.
            if(newResponse[9].length > 0 && newResponse[9][0] != "None found, add some") {
                const directorsInput = document.getElementById("animeDirectors");
                updateDetector == true ? directorsInput.value += (directorsInput.value == "" ? newResponse[9].join(", ") : ", " + newResponse[9].join(", ")) : directorsInput.value = newResponse[9].join(", ");
                directorsInput.classList.add("valid");
                directorsInput.nextElementSibling.classList.add("active");
            }
            // Update the anime producers if available.
            if(newResponse[10].length > 0 && newResponse[10][0] != "None found, add some") {
                const producersInput = document.getElementById("animeProducers");
                updateDetector == true ? producersInput.value += (producersInput.value == "" ? newResponse[10].join(", ") : ", " + newResponse[10].join(", ")) : producersInput.value = newResponse[10].join(", ");
                producersInput.classList.add("valid");
                producersInput.nextElementSibling.classList.add("active");
            }
            // Update the anime writers if available.
            if(newResponse[11].length > 0 && newResponse[11][0] != "None found, add some") {
                const writersInput = document.getElementById("animeWriters");
                updateDetector == true ? writersInput.value += (writersInput.value == "" ? newResponse[11].join(", ") : ", " + newResponse[11].join(", ")) : writersInput.value = newResponse[11].join(", ");
                writersInput.classList.add("valid");
                writersInput.nextElementSibling.classList.add("active");
            }
            // Update the anime musicians if available.
            if(newResponse[12].length > 0 && newResponse[12][0] != "None found, add some") {
                const musicInput = document.getElementById("animeMusicians");
                updateDetector == true ? musicInput.value += (musicInput.value == "" ? newResponse[12].join(", ") : ", " + newResponse[12].join(", ")) : musicInput.value = newResponse[12].join(", ");
                musicInput.classList.add("valid");
                musicInput.nextElementSibling.classList.add("active");
            }
            // Update the anime synopsis if available.
            if(newResponse[13] != "" && newResponse[13] != "None found, add some") {
                const synopsisInput = document.getElementById("animeSynopsis");
                let textHolder = newResponse[13].replace("[Written by MAL Rewrite]", "");
                if(textHolder.includes("(Source:")) {
                    textHolder = textHolder.substring(0, textHolder.indexOf("(Source:"));
                }
                textHolder = textHolder.trim();
                synopsisInput.value = textHolder;
                synopsisInput.classList.add("valid");
                synopsisInput.nextElementSibling.classList.add("active");
                M.textareaAutoResize(synopsisInput);
            }
            // Reset all anime genres to not be checked.
            Array.from(document.querySelectorAll(".genreRow .filled-in")).forEach(inp => inp.checked = false);
            // Iterate through the fetched list of genres and check them off on the page if available.
            const extraGenres = document.getElementById("otherGenres");
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
                else {
                    extraGenres.value == "" ? extraGenres.value = genreIter : extraGenres.value += ", " + genreIter;
                }
            });
            if(extraGenres.value != "") { extraGenres.nextElementSibling.classList.add("active"); }
            setTimeout(() => {
                // Reset the related content modal.
                if(updateDetector == false) {
                    document.getElementById("animeList").innerHTML = "";
                }
                const listNum = document.getElementById("animeList").children.length + 1;
                // If the anime type is a season then add a season to the related content.
                if(newResponse[5] == "TV" || parseInt(newResponse[6]) > 1) {
                    // Attach a season.
                    seasonAddition();
                    const seasonName = document.getElementById("li_" + listNum + "_Season_Name");
                    // If the start date is provided then set it as the value for the season start date input. 
                    if(newResponse[3] != "") {
                        let dateStart = new Date(newResponse[3]);
                        dateStart.setDate(dateStart.getDate() - 1);
                        document.getElementById("li_" + listNum + "_Season_Start").value = dateStart.getFullYear() + "-"
                            + (dateStart.getMonth() + 1 > 9 ? dateStart.getMonth() + 1 : "0" + (dateStart.getMonth() + 1)) + "-"
                            + (dateStart.getDate() + 1 > 9 ? dateStart.getDate() + 1 : "0" + (dateStart.getDate() + 1));
                    }
                    // If the end date is provided then set it as the value for the season end date input. 
                    if(newResponse[4] != "") {
                        let dateEnd = new Date(newResponse[4]);
                        dateEnd.setDate(dateEnd.getDate() - 1);
                        document.getElementById("li_" + listNum + "_Season_End").value = dateEnd.getFullYear() + "-"
                            + (dateEnd.getMonth() + 1 > 9 ? dateEnd.getMonth() + 1 : "0" + (dateEnd.getMonth() + 1)) + "-"
                            + (dateEnd.getDate() + 1 > 9 ? dateEnd.getDate() + 1 : "0" + (dateEnd.getDate() + 1));
                    }
                    // Provide a default season name.
                    seasonName.value = "Season";
                    seasonName.classList.add("valid");
                    seasonName.nextElementSibling.classList.add("active");
                    // Add the appropriate number of episodes with a default episode name.
                    for(let f = 0; f < parseInt(newResponse[6]); f++) {
                        document.getElementById("li_" + listNum + "_Season_AddEpisode").click();
                        let episodeName = document.getElementById("li_" + listNum + "_Episode_Name_" + (f + 1));
                        episodeName.value = "Episode " + (f + 1);
                        episodeName.classList.add("valid");
                        episodeName.nextElementSibling.classList.add("active");
                    }
                    // Hide the episodes by default.
                    document.getElementById("li_" + listNum + "_Season").children[0].click();
                }
                else {
                    // Attach a single film/ona/ova.
                    singleAddition();
                    const singleName = document.getElementById("li_" + listNum + "_Single_Name"),
                        singleType = document.getElementById("li_" + listNum + "_Single_Type");
                    // If the release date is provided then set it as the value for the single release date input. 
                    if(newResponse[3] != "") {
                        let dateStart = new Date(newResponse[3]);
                        dateStart.setDate(dateStart.getDate() - 1);
                        document.getElementById("li_" + listNum + "_Single_Release").value = dateStart.getFullYear() + "-"
                            + (dateStart.getMonth() + 1 > 9 ? dateStart.getMonth() + 1 : "0" + (dateStart.getMonth() + 1)) + "-"
                            + (dateStart.getDate() + 1 > 9 ? dateStart.getDate() + 1 : "0" + (dateStart.getDate() + 1));
                    }
                    // Provide a default film/ona/ova name.
                    singleName.value = "Item 1";
                    singleName.classList.add("valid");
                    singleName.nextElementSibling.classList.add("active");
                    // Set the type for the item.
                    singleType.value = newResponse[5];
                    // Initialize the select tags.
                    initSelect();
                }
                // Hide the preloader now that everything has been loaded and show the buttons if necessary.
                animePreloader.style.visibility = "hidden";
                animeMoreBtn.style.visibility = "visible";
                animeFetchBtn.style.visibility = "visible";
                animeSave.style.visibility = "visible";
                animeOptions.style.visibility = "visible";
            }, 500);
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