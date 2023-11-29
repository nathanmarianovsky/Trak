/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

    - imgButtons: Adds the functionality for all image buttons based on the category currently chosen.
    - bookSave: Processes the information required to save a book record.
    - filmSave: Processes the information required to save a film record.
    - recordChoicesButtons: Listen for click events on the record choices.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



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

Processes the information required to save a book record.

*/
var bookSave = () => {
    // Define the page save button.
    const bookSaveBtn = document.getElementById("bookSave");
    // Listen for a click on the save button.
    bookSaveBtn.addEventListener("click", e => {
        e.preventDefault();
        // Define the page components which will contain all associated details.
        const bookTitle = document.getElementById("bookTitle").value,
            bookOriginalTitle = document.getElementById("bookOriginalTitle").value,
            bookISBN = document.getElementById("bookISBN").value.replace(/\W/g,""),
            bookAuthors = document.getElementById("bookAuthor").value,
            bookPublisher = document.getElementById("bookPublisher").value,
            bookPublicationDate = document.getElementById("bookPublicationDate").value,
            bookPages = document.getElementById("bookPages").value,
            bookLastRead = document.getElementById("bookLastRead").value,
            bookMediaType = document.getElementById("bookMediaType").value,
            bookSynopsis = document.getElementById("bookSynopsis").value,
            bookRating = document.getElementById("bookRating").value,
            bookReview = document.getElementById("bookReview").value,
            bookImg = document.getElementById("addRecordBookImg").getAttribute("list").split(","),
            bookFiles = Array.from(document.getElementById("bookAddRecordFiles").files).map(elem => elem.path),
            otherGenres = document.getElementById("bookOtherGenres").value.split(",").map(elem => elem.trim()),
            genresLst = genreList("Book"),
            genres = [];
        // Check to see that a proper ISBN was provided.
        if(bookISBN.length == 13 || bookISBN.length == 10) {
            // Save all information about the genres.
            for(let p = 0; p < genresLst.length; p++) {
                genres.push(document.getElementById("bookGenre" + genresLst[p]).checked);
            }
            const ogName = document.getElementById("bookTitle").getAttribute("oldName"),
                ogISBN = document.getElementById("bookTitle").getAttribute("oldISBN"),
                oldTitle = ogName !== null ? ogName : bookTitle,
                oldISBN = ogISBN !== null ? ogISBN : bookISBN;
            // Send the request to the back-end portion of the app.
            const submissionMaterial = ["Book", bookTitle, bookOriginalTitle, bookISBN, bookAuthors, bookPublisher, bookPublicationDate,
                bookPages, bookLastRead, bookMediaType, bookFiles, bookSynopsis, bookRating, bookReview, [genresLst, genres, otherGenres],
                [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), bookImg], [oldISBN, oldTitle]];
            ipcRenderer.send("performSave", submissionMaterial);
        }
        // If no ISBN has been provided then notify the user.
        else { M.toast({"html": "A book record requires that an ASIN/ISBN be provided.", "classes": "rounded"}); }
    });
};



/*

Processes the information required to save a film record.

*/
var filmSave = () => {
    // // Define the page save button.
    // const animeSaveBtn = document.getElementById("animeSave");
    // // Listen for a click on the save button.
    // animeSaveBtn.addEventListener("click", e => {
    //     e.preventDefault();
    //     // Define the page components which will contain all associated details.
    //     const animeList = document.getElementById("animeList"),
    //         animeName = document.getElementById("animeName").value,
    //         animeJapaneseName = document.getElementById("animeJapaneseName").value,
    //         animeReview = document.getElementById("animeReview").value,
    //         animeDirectors = document.getElementById("animeDirectors").value,
    //         animeProducers = document.getElementById("animeProducers").value,
    //         animeWriters = document.getElementById("animeWriters").value,
    //         animeMusicians = document.getElementById("animeMusicians").value,
    //         animeStudio = document.getElementById("animeStudio").value,
    //         animeLicense = document.getElementById("animeLicense").value,
    //         animeSynopsis = document.getElementById("animeSynopsis").value,
    //         animeImg = document.getElementById("addRecordAnimeImg").getAttribute("list").split(","),
    //         animeFiles = Array.from(document.getElementById("animeAddRecordFiles").files).map(elem => elem.path),
    //         otherGenres = document.getElementById("animeOtherGenres").value.split(",").map(elem => elem.trim()),
    //         genresLst = genreList("Anime"),
    //         genres = [],
    //         content = [];
    //     // Check to see that at least one name was provided.
    //     if(animeName != "" || animeJapaneseName != "") {
    //         // Save all information about the genres.
    //         for(let p = 0; p < genresLst.length; p++) {
    //             genres.push(document.getElementById("animeGenre" + genresLst[p]).checked);
    //         }
    //         // For each table item in the related content table process the associated information.
    //         for(let q = 1; q < animeList.children.length + 1; q++) {
    //             let animeListChild = animeList.children[q - 1],
    //                 animeListChildCondition = animeListChild.id.split("_")[2],
    //                 curContent = [];
    //             // Attain the details on a film/ONA/OVA.
    //             if(animeListChildCondition == "Single") {
    //                 let singleName = document.getElementById("li_" + q + "_Single_Name").value,
    //                     singleType = document.getElementById("li_" + q + "_Single_Type").value,
    //                     singleRelease = document.getElementById("li_" + q + "_Single_Release").value,
    //                     singleLastWatched = document.getElementById("li_" + q + "_Single_LastWatched").value,
    //                     singleRating = document.getElementById("li_" + q + "_Single_Rating").value,
    //                     singleReview = document.getElementById("li_" + q + "_Single_Review").value;
    //                 curContent.push("Single", singleName, singleType, singleRelease, singleLastWatched, singleRating, singleReview);
    //             }
    //             // Attain the details on a season and its episodes.
    //             else if(animeListChildCondition == "Season") {
    //                 let seasonName = document.getElementById("li_" + q + "_Season_Name").value,
    //                     seasonStart = document.getElementById("li_" + q + "_Season_Start").value,
    //                     seasonEnd = document.getElementById("li_" + q + "_Season_End").value,
    //                     seasonStatus = document.getElementById("li_" + q + "_Season_Status").value,
    //                     seasonEpisodes = [];
    //                 for(let r = 1; r < animeListChild.children[1].children[0].children.length + 1; r++) {
    //                     let seasonEpisodeName = document.getElementById("li_" + q + "_Episode_Name_" + r).value,
    //                         seasonEpisodeLastWatched = document.getElementById("li_" + q + "_Episode_LastWatched_" + r).value,
    //                         seasonEpisodeRating = document.getElementById("li_" + q + "_Episode_Rating_" + r).value,
    //                         seasonEpisodeReview = document.getElementById("li_" + q + "_Episode_Review_" + r).value;
    //                     seasonEpisodes.push([seasonEpisodeName, seasonEpisodeLastWatched, seasonEpisodeRating, seasonEpisodeReview]);
    //                 }
    //                 curContent.push("Season", seasonName, seasonStart, seasonEnd, seasonStatus, seasonEpisodes);
    //             }
    //             // Push the table item information into the array holding all related content details.
    //             content.push(curContent);
    //         }
    //         const ogName = document.getElementById("animeName").getAttribute("oldName"),
    //             oldTitle = ogName !== null ? ogName : animeName;
    //         // Send the request to the back-end portion of the app.
    //         const submissionMaterial = ["Anime", animeName, animeJapaneseName, animeReview, animeDirectors, animeProducers, animeWriters,
    //             animeMusicians, animeStudio, animeLicense, animeFiles, [genresLst, genres, otherGenres], content, animeSynopsis,
    //             [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), animeImg], oldTitle];
    //         ipcRenderer.send("performSave", submissionMaterial);
    //     }
    //     // If no name has been provided then notify the user.
    //     else { M.toast({"html": "An anime record requires that either an English or Japanese name is provided.", "classes": "rounded"}); }
    // });
};



/*

Listen for click events on the record choices.

*/
var recordChoicesButtons = () => {
    // Define the buttons for all record choices.
    const categoryAnime = document.getElementById("categoryAnime"),
        categoryBook = document.getElementById("categoryBook"),
        categoryFilm = document.getElementById("categoryFilm"),
        categoryManga = document.getElementById("categoryManga");
    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryLinks = document.getElementsByClassName("categoryLink"),
        categoryInitial = document.getElementById("categoryInitial"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv"),
        categoryBookDiv = document.getElementById("categoryBookDiv"),
        categoryFilmDiv = document.getElementById("categoryFilmDiv"),
        categoryMangaDiv = document.getElementById("categoryMangaDiv");
    // Define the color which will be applied to the favorite image icon.
    const btnColorFavorite = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
    let introAnimeHolder = false,
        introBookHolder = false,
        introFilmHolder = false,
        introMangaHolder = false;
    ipcRenderer.on("addIntroduction", event => {
        introAnimeHolder = true;
        introBookHolder = true;
        introFilmHolder = true;
        introMangaHolder = true;
    });
    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryAnimeDiv, categoryAnime);
        // Display the correct input associated to the anime other genres/tags.
        otherGenresReset("Anime");
        // Initialize the dragging of the related content.
        dragInit("Anime");
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
            animePreloader = document.getElementById("animePreloader"),
            animeNameAutocomplete = autoCompleteInit("Anime", animeName, animePreloader),
            animeNameUL = animeName.nextElementSibling,
            animeMoreBtn = document.getElementById("animeMoreDetailsBtn"),
            animeFetchBtn = document.getElementById("animeFetchDetailsBtn"),
            animeSave = document.getElementById("animeSave"),
            animeOptions = document.getElementById("animeOptions"),
            animeSynopsis = document.getElementById("animeSynopsis"),
            animeReview = document.getElementById("animeReview");
        // Listen for changes in the book description in order to hide/show a vertical scroll.
        animeSynopsis.addEventListener("input", e => textAreaFunc(animeSynopsis));
        // Listen for changes in the book comments/review in order to hide/show a vertical scroll.
        animeReview.addEventListener("input", e => textAreaFunc(animeReview));
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        animeFetchBtn.addEventListener("click", e => nameFetchFunc("Anime", animeName, animePreloader));
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "";
        // Listen for an input change in the anime name in order to fetch autocomplete options from myanimelist.
        animeName.addEventListener("input", e => previousName = nameAutoCompleteFunc("Anime", e.target, previousName, animeNameAutocomplete, true));
        // Listen for a click event on the anime name in order to trigger a fetch of autocomplete options from myanimelist.
        animeName.addEventListener("click", e => nameAutoCompleteFunc("Anime", e.target, previousName, animeNameAutocomplete, false));
        // Provide the autocomplete listener associated to anime records.
        autoCompleteListener("Anime", animeName, animeNameUL, animeNameAutocomplete);
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
            setFetchedImages("Anime", btnColorFavorite, newResponse[2]);
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
                let textHolder = newResponse[13].replace("[Written by MAL Rewrite]", "");
                if(textHolder.includes("(Source:")) {
                    textHolder = textHolder.substring(0, textHolder.indexOf("(Source:"));
                }
                textHolder = textHolder.trim();
                animeSynopsis.value = textHolder;
                animeSynopsis.classList.add("valid");
                animeSynopsis.nextElementSibling.classList.add("active");
                M.textareaAutoResize(animeSynopsis);
            }
            // Update the anime genres if available.
            genreFill("Anime", newResponse[7]);
            setTimeout(() => {
                // Reset the related content modal.
                if(updateDetector == false) {
                    document.getElementById("animeList").innerHTML = "";
                }
                const listNum = document.getElementById("animeList").children.length + 1;
                // If the anime type is a season then add a season to the related content.
                clearTooltips();
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
                }
                relatedContentFinisher();
                resetAnimeContentCounters();
                // Hide the preloader now that everything has been loaded and show the buttons if necessary.
                animePreloader.style.visibility = "hidden";
                animeMoreBtn.style.visibility = "visible";
                animeFetchBtn.style.visibility = "visible";
                animeSave.style.visibility = "visible";
                animeOptions.style.visibility = "visible";
            }, 500);
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        if(introAnimeHolder == true) {
            const instancesTapAnimeSave = M.TapTarget.init(document.getElementById("introductionTargetAnimeSave"), { "onClose": () => {
                setTimeout(() => {
                    const instancesTapAnimeOptions = M.TapTarget.init(document.getElementById("introductionTargetAnimeOptions"));
                    setTimeout(() => {
                        instancesTapAnimeOptions.open();
                        introAnimeHolder = false;
                    }, 500);
                }, 500);
            }});
            setTimeout(() => { instancesTapAnimeSave.open(); }, 500);
        }
    });
    // Listen for a click event on the categoryBook button on the top bar to display the form corresponding to a book record.
    categoryBook.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryBookDiv, categoryBook);
        // Display the correct input associated to the book other genres/tags.
        otherGenresReset("Book");
        // Define all image buttons.
        const bookPreviousImgBtn = document.getElementById("bookPreviousImgBtn"),
            bookAddImgBtn = document.getElementById("bookAddImgBtn"),
            bookAddImgInput = document.getElementById("bookAddImgInput"),
            bookRemoveImgBtn = document.getElementById("bookRemoveImgBtn"),
            bookNextImgBtn = document.getElementById("bookNextImgBtn"),
            addRecordBookImg = document.getElementById("addRecordBookImg"),
            bookFavoriteImageLink = document.getElementById("bookFavoriteImageLink"),
            bookSynopsis = document.getElementById("bookSynopsis"),
            bookReview = document.getElementById("bookReview");
        imgButtons(bookFavoriteImageLink, bookPreviousImgBtn, bookAddImgBtn, bookAddImgInput, bookRemoveImgBtn, bookNextImgBtn, addRecordBookImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const bookTitle = document.getElementById("bookTitle"),
            bookISBN = document.getElementById("bookISBN"),
            bookPreloader = document.getElementById("bookPreloader"),
            bookTitleAutocomplete = autoCompleteInit("Book", bookTitle, bookPreloader),
            bookTitleUL = bookTitle.nextElementSibling,
            bookFetchBtn = document.getElementById("bookFetchDetailsBtn"),
            bookSave = document.getElementById("bookSave");
        // Listen for changes in the book ISBN in order to format it properly.
        bookISBN.addEventListener("input", e => formatISBN(bookISBN));
        // Listen for changes in the book description in order to hide/show a vertical scroll.
        bookSynopsis.addEventListener("input", e => textAreaFunc(bookSynopsis));
        // Listen for changes in the book comments/review in order to hide/show a vertical scroll.
        bookReview.addEventListener("input", e => textAreaFunc(bookReview));
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        bookFetchBtn.addEventListener("click", e => valueFetchFunc("Book", bookISBN, bookPreloader));
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "";
        // Listen for an input change in the book title in order to fetch autocomplete options from goodreads.
        bookTitle.addEventListener("input", e => previousName = nameAutoCompleteFunc("Book", e.target, previousName, bookTitleAutocomplete, true));
        // Listen for a click event on the book title in order to trigger a fetch of autocomplete options from goodreads.
        bookTitle.addEventListener("click", e => nameAutoCompleteFunc("Book", e.target, previousName, bookTitleAutocomplete, false));
        // Provide the autocomplete listener associated to book records.
        autoCompleteListener("Book", bookTitle, bookTitleUL, bookTitleAutocomplete);
        // Update the page accordingly based on the fetched book details.
        ipcRenderer.on("bookFetchDetailsResult", (newEve, newResponse) => {
            if(newResponse[0] != "") {
                const bookTitle = document.getElementById("bookTitle");
                bookTitle.value = newResponse[0];
                if(newResponse[0] != "") {
                    bookTitle.classList.add("valid");
                    bookTitle.nextElementSibling.nextElementSibling.classList.add("active");
                }
                else {
                    bookTitle.classList.remove("valid");
                    bookTitle.nextElementSibling.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookTitle.value = "";
                bookTitle.classList.remove("valid");
            }
            if(newResponse[1] !== null) {
                const bookOriginalTitle = document.getElementById("bookOriginalTitle");
                bookOriginalTitle.value = newResponse[1];
                newResponse[1] != "" ? bookOriginalTitle.classList.add("valid") : bookOriginalTitle.classList.remove("valid");
            }
            else {
                bookOriginalTitle.value = "";
                bookOriginalTitle.classList.remove("valid");
            }
            setFetchedImages("Book", btnColorFavorite, [newResponse[2], [newResponse[2]]]);
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
                formatISBN(bookISBN);
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
            if(newResponse[6] !== null && newResponse[6] != "") {
                const bookPublicationDate = document.getElementById("bookPublicationDate");
                bookPublicationDate.value = new Date(newResponse[6]).toISOString().split("T")[0];
                bookPublicationDate.classList.add("valid");
            }
            else {
                bookPublicationDate.value = "";
                bookPublicationDate.classList.remove("valid");
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
                const bookMediaType = document.getElementById("bookMediaType"),
                    checkVal = newResponse[8].toLowerCase();
                if(checkVal.includes("hardcover")) {
                    bookMediaType.value = "hardcover";
                }
                else if(checkVal.includes("softcover") || checkVal.includes("paperback")) {
                    bookMediaType.value = "softcover";
                }
                else if(checkVal.includes("ebook") || checkVal.includes("kindle")) {
                    bookMediaType.value = "ebook";
                }
                else {
                    bookMediaType.value = "audiobook";
                }
            }
            if(newResponse[9] !== null) {
                bookSynopsis.value = newResponse[9];
                if(newResponse[9] != "") {
                    bookSynopsis.classList.add("valid");
                    bookSynopsis.nextElementSibling.classList.add("active");
                }
                else {
                    bookSynopsis.classList.remove("valid");
                    bookSynopsis.nextElementSibling.classList.remove("active");
                }
            }
            else {
                bookSynopsis.value = "";
                bookSynopsis.classList.remove("valid");
                bookSynopsis.nextElementSibling.classList.remove("active");
            }
            M.textareaAutoResize(bookSynopsis);
            parseInt(bookSynopsis.style.height) > parseInt(getComputedStyle(bookSynopsis).maxHeight) ? bookSynopsis.style.overflowY = "scroll" : bookSynopsis.style.overflowY = "hidden";
            // Update the book genres if available.
            genreFill("Book", newResponse[10]);
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            bookPreloader.style.visibility = "hidden";
            bookFetchBtn.style.visibility = "visible";
            bookSave.style.visibility = "visible";
            initSelect();
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        if(introBookHolder == true) {
            const instancesTapBookSave = M.TapTarget.init(document.getElementById("introductionTargetBookSave"));
            setTimeout(() => {
                instancesTapBookSave.open();
                introBookHolder = false;
            }, 500);
        }
    });




    // Listen for a click event on the categoryFilm button on the top bar to display the form corresponding to a film record.
    categoryFilm.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryFilmDiv, categoryFilm);
        // Display the correct input associated to the anime other genres/tags.
        otherGenresReset("Film");
        // Define all image buttons.
        const filmPreviousImgBtn = document.getElementById("filmPreviousImgBtn"),
            filmAddImgBtn = document.getElementById("filmAddImgBtn"),
            filmAddImgInput = document.getElementById("filmAddImgInput"),
            filmRemoveImgBtn = document.getElementById("filmRemoveImgBtn"),
            filmNextImgBtn = document.getElementById("filmNextImgBtn"),
            addRecordFilmImg = document.getElementById("addRecordFilmImg"),
            filmFavoriteImageLink = document.getElementById("filmFavoriteImageLink");
        imgButtons(filmFavoriteImageLink, filmPreviousImgBtn, filmAddImgBtn, filmAddImgInput, filmRemoveImgBtn, filmNextImgBtn, addRecordFilmImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const filmName = document.getElementById("filmName"),
            filmPreloader = document.getElementById("filmPreloader"),
            filmNameAutocomplete = autoCompleteInit("Film", filmName, filmPreloader),
            filmNameUL = filmName.nextElementSibling,
            filmMoreBtn = document.getElementById("filmMoreDetailsBtn"),
            filmFetchBtn = document.getElementById("filmFetchDetailsBtn"),
            filmSave = document.getElementById("filmSave"),
            filmSynopsis = document.getElementById("filmSynopsis"),
            filmReview = document.getElementById("filmReview"),
            filmRunTimeInput = document.getElementById("filmRunningTime");
        // Listen for changes in the book description in order to hide/show a vertical scroll.
        filmSynopsis.addEventListener("input", e => textAreaFunc(filmSynopsis));
        // Listen for changes in the book comments/review in order to hide/show a vertical scroll.
        filmReview.addEventListener("input", e => textAreaFunc(filmReview));
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        filmFetchBtn.addEventListener("click", e => nameFetchFunc("Film", filmName, filmPreloader));
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "";
        // Listen for an input change in the film name in order to fetch autocomplete options from imdb.
        filmName.addEventListener("input", e => previousName = nameAutoCompleteFunc("Film", e.target, previousName, filmNameAutocomplete, true));
        // Listen for a click event on the film name in order to trigger a fetch of autocomplete options from imdb.
        filmName.addEventListener("click", e => nameAutoCompleteFunc("Film", e.target, previousName, filmNameAutocomplete, false));
        // Provide the autocomplete listener associated to film records.
        autoCompleteListener("Film", filmName, filmNameUL, filmNameAutocomplete);
        filmRunTimeInput.addEventListener("input", e => e.target.value = formatRunningTime(e.target.value));
        // Update the page accordingly based on the fetched film details.
        ipcRenderer.on("filmFetchDetailsResult", (newEve, newResponse) => {
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none";
            // Update the film alternate name if available.
            if(newResponse[1] !== null && newResponse[1] != "") {
                const filmAlternateName = document.getElementById("filmAlternateName");
                updateDetector == true ? filmAlternateName.value += (filmAlternateName.value == "" ? newResponse[1] : ", " + newResponse[1]) : filmAlternateName.value = newResponse[1];
                newResponse[1] != "" ? filmAlternateName.classList.add("valid") : filmAlternateName.classList.remove("valid");
            }
            else {
                filmAlternateName.value = "";
                filmAlternateName.classList.remove("valid");
            }
            setFetchedImages("Film", btnColorFavorite, newResponse[2]);
            // Update the film release date if available.
            if(newResponse[3] !== null && newResponse[3] != "") {
                const filmReleaseDate = document.getElementById("filmReleaseDate");
                filmReleaseDate.value = new Date(newResponse[3]).toISOString().split("T")[0];
                filmReleaseDate.classList.add("valid");
            }
            else {
                filmReleaseDate.value = "";
                filmReleaseDate.classList.remove("valid");
            }
            // Update the film runtime if available.
            if(newResponse[4] != "") {
                updateDetector == true ? filmRunTimeInput.value += (filmRunTimeInput.value == "" ? formatRunningTime(newResponse[4]) : ", " + formatRunningTime(newResponse[4])) : filmRunTimeInput.value = formatRunningTime(newResponse[4]);
                filmRunTimeInput.classList.add("valid");
                filmRunTimeInput.nextElementSibling.classList.add("active");
            }
            else {
                filmRunTimeInput.value = "";
                filmRunTimeInput.classList.remove("valid");
            }
            // Update the film directors if available.
            if(newResponse[6] != "") {
                const directorsInput = document.getElementById("filmDirectors");
                updateDetector == true ? directorsInput.value += (directorsInput.value == "" ? newResponse[6].join(", ") : ", " + newResponse[6].join(", ")) : directorsInput.value = newResponse[6].join(", ");
                directorsInput.classList.add("valid");
                directorsInput.nextElementSibling.classList.add("active");
            }
            else {
                directorsInput.value = "";
                directorsInput.classList.remove("valid");
            }
            // Update the film writers if available.
            if(newResponse[7] != "") {
                const writersInput = document.getElementById("filmWriters");
                updateDetector == true ? writersInput.value += (writersInput.value == "" ? newResponse[7].join(", ") : ", " + newResponse[7].join(", ")) : writersInput.value = newResponse[7].join(", ");
                writersInput.classList.add("valid");
                writersInput.nextElementSibling.classList.add("active");
            }
            else {
                writersInput.value = "";
                writersInput.classList.remove("valid");
            }
            // Update the film distributors if available.
            if(newResponse[8] != "") {
                const distributorsInput = document.getElementById("filmDistributors");
                updateDetector == true ? distributorsInput.value += (distributorsInput.value == "" ? newResponse[8].join(", ") : ", " + newResponse[8].join(", ")) : distributorsInput.value = newResponse[8].join(", ");
                distributorsInput.classList.add("valid");
                distributorsInput.nextElementSibling.classList.add("active");
            }
            else {
                distributorsInput.value = "";
                distributorsInput.classList.remove("valid");
            }
            // Update the film producers if available.
            if(newResponse[9] != "") {
                const producersInput = document.getElementById("filmProducers");
                updateDetector == true ? producersInput.value += (producersInput.value == "" ? newResponse[9].join(", ") : ", " + newResponse[9].join(", ")) : producersInput.value = newResponse[9].join(", ");
                producersInput.classList.add("valid");
                producersInput.nextElementSibling.classList.add("active");
            }
            else {
                producersInput.value = "";
                producersInput.classList.remove("valid");
            }
            // Update the film production companies if available.
            if(newResponse[10] != "") {
                const productionCompaniesInput = document.getElementById("filmProductionCompanies");
                updateDetector == true ? productionCompaniesInput.value += (productionCompaniesInput.value == "" ? newResponse[10].join(", ") : ", " + newResponse[10].join(", ")) : productionCompaniesInput.value = newResponse[10].join(", ");
                productionCompaniesInput.classList.add("valid");
                productionCompaniesInput.nextElementSibling.classList.add("active");
            }
            else {
                productionCompaniesInput.value = "";
                productionCompaniesInput.classList.remove("valid");
            }
            // Update the film stars if available.
            if(newResponse[11] != "") {
                const starsInput = document.getElementById("filmStarring");
                updateDetector == true ? starsInput.value += (starsInput.value == "" ? newResponse[11].join(", ") : ", " + newResponse[11].join(", ")) : starsInput.value = newResponse[11].join(", ");
                starsInput.classList.add("valid");
                starsInput.nextElementSibling.classList.add("active");
            }
            else {
                starsInput.value = "";
                starsInput.classList.remove("valid");
            }
            // Update the film plot if available.
            if(newResponse[12] != "") {
                filmSynopsis.value = newResponse[12].trim();
                filmSynopsis.classList.add("valid");
                filmSynopsis.nextElementSibling.classList.add("active");
                M.textareaAutoResize(filmSynopsis);
            }
            else {
                filmSynopsis.value = "";
                filmSynopsis.classList.remove("valid");
            }
            // Update the film genres if available.
            genreFill("Film", newResponse[5]);
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            filmPreloader.style.visibility = "hidden";
            filmFetchBtn.style.visibility = "visible";
            filmSave.style.visibility = "visible";
            initSelect();
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        if(introFilmHolder == true) {
            const instancesTapFilmSave = M.TapTarget.init(document.getElementById("introductionTargetFilmSave"));
            setTimeout(() => {
                instancesTapFilmSave.open();
                introFilmHolder = false;
            }, 500);
        }
    });




    // Listen for a click event on the categoryManga button on the top bar to display the form corresponding to a manga record.
    categoryManga.addEventListener("click", e => {
        e.preventDefault();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryMangaDiv, categoryManga);
        // Display the correct input associated to the manga other genres/tags.
        otherGenresReset("Manga");
        // Initialize the dragging of the related content.
        dragInit("Manga");
        // Define all image buttons.
        const mangaPreviousImgBtn = document.getElementById("mangaPreviousImgBtn"),
            mangaAddImgBtn = document.getElementById("mangaAddImgBtn"),
            mangaAddImgInput = document.getElementById("mangaAddImgInput"),
            mangaRemoveImgBtn = document.getElementById("mangaRemoveImgBtn"),
            mangaNextImgBtn = document.getElementById("mangaNextImgBtn"),
            addRecordMangaImg = document.getElementById("addRecordMangaImg"),
            mangaFavoriteImageLink = document.getElementById("mangaFavoriteImageLink");
        imgButtons(mangaFavoriteImageLink, mangaPreviousImgBtn, mangaAddImgBtn, mangaAddImgInput, mangaRemoveImgBtn, mangaNextImgBtn, addRecordMangaImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const mangaName = document.getElementById("mangaName"),
            mangaPreloader = document.getElementById("mangaPreloader"),
            volumeFetchPreloader = document.getElementById("volumeFetchPreloader"),
            mangaNameAutocomplete = autoCompleteInit("Manga", mangaName, mangaPreloader, volumeFetchPreloader),
            mangaNameUL = animeName.nextElementSibling,
            mangaMoreBtn = document.getElementById("mangaMoreDetailsBtn"),
            mangaFetchBtn = document.getElementById("mangaFetchDetailsBtn"),
            mangaSave = document.getElementById("mangaSave"),
            mangaOptions = document.getElementById("mangaOptions"),
            mangaSynopsis = document.getElementById("mangaSynopsis"),
            mangaReview = document.getElementById("mangaReview");
        // Listen for changes in the manga description in order to hide/show a vertical scroll.
        mangaSynopsis.addEventListener("input", e => textAreaFunc(mangaSynopsis));
        // Listen for changes in the manga comments/review in order to hide/show a vertical scroll.
        mangaReview.addEventListener("input", e => textAreaFunc(mangaReview));
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        mangaFetchBtn.addEventListener("click", e => nameFetchFunc("Manga", mangaName, mangaPreloader, volumeFetchPreloader));
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "";
        // Listen for an input change in the manga name in order to fetch autocomplete options from myanimelist.
        mangaName.addEventListener("input", e => previousName = nameAutoCompleteFunc("Manga", e.target, previousName, mangaNameAutocomplete, true));
        // Listen for a click event on the manga name in order to trigger a fetch of autocomplete options from myanimelist.
        mangaName.addEventListener("click", e => nameAutoCompleteFunc("Manga", e.target, previousName, mangaNameAutocomplete, false));
        // Provide the autocomplete listener associated to manga records.
        autoCompleteListener("Manga", mangaName, mangaNameUL, mangaNameAutocomplete);
        // Update the page accordingly based on the fetched anime details.
        ipcRenderer.on("mangaFetchDetailsResult", (newEve, newResponse) => {
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none";
            if(newResponse[0] != "" && newResponse[0] != "None found, add some") {
                updateDetector == true ? mangaName.value += newResponse[0] : mangaName.value = newResponse[0];
                mangaName.value = newResponse[0];
                mangaName.classList.add("valid");
                mangaName.parentNode.children[2].classList.add("active");
            }
            // Update the manga japanese name if available.
            if(newResponse[1] != "" && newResponse[1] != "None found, add some") {
                const jnameInput = document.getElementById("mangaJapaneseName");
                updateDetector == true ? jnameInput.value += newResponse[1] : jnameInput.value = newResponse[1];
                jnameInput.value = newResponse[1];
                jnameInput.classList.add("valid");
                jnameInput.nextElementSibling.classList.add("active");
            }
            setFetchedImages("Manga", btnColorFavorite, newResponse[2]);
            // Update the manga start date if available.
            if(newResponse[3] !== null && newResponse[3] != "" && newResponse[3] != " ?") {
                const mangaStartDate = document.getElementById("mangaStartDate");
                mangaStartDate.value = new Date(newResponse[3]).toISOString().split("T")[0];
                mangaStartDate.classList.add("valid");
            }
            else {
                mangaStartDate.value = "";
                mangaStartDate.classList.remove("valid");
            }
            // Update the manga end date if available.
            if(newResponse[4] !== null && newResponse[4] != "" && newResponse[4] != " ?") {
                const mangaEndDate = document.getElementById("mangaEndDate");
                mangaEndDate.value = new Date(newResponse[4]).toISOString().split("T")[0];
                mangaEndDate.classList.add("valid");
            }
            else {
                mangaEndDate.value = "";
                mangaEndDate.classList.remove("valid");
            }
            // Update the manga writers if available.
            if(newResponse[8].length > 0) {
                const writersInput = document.getElementById("mangaWriters"),
                    writerStr = newResponse[8].map(writer => writer.split(", ").reverse().join(" ")).join(", ");
                updateDetector == true ? writersInput.value += (writersInput.value == "" ? writerStr : ", " + writerStr) : writersInput.value = writerStr;
                writersInput.classList.add("valid");
                writersInput.nextElementSibling.classList.add("active");
            }
            // Update the manga synopsis if available.
            if(newResponse[9] != "" && newResponse[9] != "None found, add some") {
                let textHolder = newResponse[9].replace("[Written by MAL Rewrite]", "");
                if(textHolder.includes("(Source:")) {
                    textHolder = textHolder.substring(0, textHolder.indexOf("(Source:"));
                }
                textHolder = textHolder.trim();
                mangaSynopsis.value = textHolder;
                mangaSynopsis.classList.add("valid");
                mangaSynopsis.nextElementSibling.classList.add("active");
                M.textareaAutoResize(mangaSynopsis);
            }
            // Update the manga genres if available.
            genreFill("Manga", newResponse[7]);
            setTimeout(() => {
                const mangaList = document.getElementById("mangaList");
                // Reset the related content modal.
                if(updateDetector == false) {
                    mangaList.innerHTML = "";
                }
                const listNum = mangaList.children.length + 1;
                // Add the appropriate manga items.
                clearTooltips();
                for(let r = 0; r < parseInt(newResponse[5]); r++) {
                    mangaItemAddition("Chapter");
                }
                for(let s = 0; s < parseInt(newResponse[6]); s++) {
                    mangaItemAddition("Volume");
                }
                relatedContentFinisher();
                resetMangaContentCounters();
                Array.from(mangaList.children).forEach(li => {
                    let scenario = li.getAttribute("id").split("_")[2];
                    if(mangaModalSwitch.checked == false) {
                        scenario == "Volume" ? li.style.display = "list-item" : li.style.display = "none";
                    }
                    else {
                        scenario == "Chapter" ? li.style.display = "list-item" : li.style.display = "none";
                    }
                });
                initSelect();
                // Hide the preloader now that everything has been loaded and show the buttons if necessary.
                mangaPreloader.style.visibility = "hidden";
                mangaMoreBtn.style.visibility = "visible";
                mangaFetchBtn.style.visibility = "visible";
                mangaSave.style.visibility = "visible";
                mangaOptions.style.visibility = "visible";
            }, 500);
        });
        // Update the page accordingly based on the fetched anime details.
        ipcRenderer.on("mangaVolumeFetchDetailsResult", (volEve, volResponse) => {
            const mangaVolumesList = Array.from(document.getElementById("mangaList").children).filter(li => li.getAttribute("id").split("_")[2] == "Volume"),
                recordImg = document.getElementById("addRecordMangaImg");
            for(let t = 0; t < volResponse.length; t++) {
                let id = mangaVolumesList[t].getAttribute("id").split("_")[1],
                    pub = document.getElementById("mangaPublisher"),
                    name = document.getElementById("li_" + id + "_Volume_Name"),
                    isbn = document.getElementById("li_" + id + "_Volume_ISBN"),
                    rel = document.getElementById("li_" + id + "_Volume_Release"),
                    syn = document.getElementById("li_" + id + "_Volume_Synopsis");
                if(volResponse[t][0] != undefined && volResponse[t][0] != "") {
                    name.value = volResponse[t][0];
                    name.classList.add("valid");
                    name.nextElementSibling.classList.add("active");
                }
                else {
                    name.classList.remove("valid");
                    name.nextElementSibling.classList.remove("active");
                }
                if(volResponse[t][1] != undefined && !recordImg.getAttribute("list").includes(volResponse[t][1])) { recordImg.setAttribute("list", recordImg.getAttribute("list") + "," + volResponse[t][1]); }
                if(volResponse[t][2] != undefined && volResponse[t][2] != "") {
                    isbn.value = volResponse[t][2];
                    isbn.classList.add("valid");
                    isbn.nextElementSibling.classList.add("active");
                    formatISBN(isbn);
                }
                else {
                    isbn.classList.remove("valid");
                    isbn.nextElementSibling.classList.remove("active");
                }
                if(volResponse[t][3] != undefined && !pub.value.includes(volResponse[t][3])) {
                    pub.value.trim().length > 0 ? pub.value += ", " + volResponse[t][3] : pub.value = volResponse[t][3];
                    pub.classList.add("valid");
                    pub.nextElementSibling.classList.add("active");
                }
                if(volResponse[t][4] != undefined && volResponse[t][4] != "") {
                    rel.value = (new Date(volResponse[t][4])).toISOString().split("T")[0];
                    rel.classList.add("valid");
                }
                else {
                    rel.value = "";
                    rel.classList.remove("valid");
                }
                if(volResponse[t][5] != undefined && volResponse[t][5] != "") {
                    syn.value = volResponse[t][5];
                    syn.classList.add("valid");
                    syn.nextElementSibling.classList.add("active");
                    M.textareaAutoResize(syn);
                }
            }
            volumeFetchPreloader.style.visibility = "hidden";
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        if(introMangaHolder == true) {
            const instancesTapMangaSave = M.TapTarget.init(document.getElementById("introductionTargetMangaSave"), { "onClose": () => {
                setTimeout(() => {
                    const instancesTapMangaOptions = M.TapTarget.init(document.getElementById("introductionTargetMangaOptions"));
                    setTimeout(() => {
                        instancesTapMangaOptions.open();
                        introMangaHolder = false;
                    }, 500);
                }, 500);
            }});
            setTimeout(() => { instancesTapMangaSave.open(); }, 500);
        }
    });
};