/*

BASIC DETAILS: This file handles all buttons on the addRecord.html page.

    - recordChoicesButtons: Listen for click events on the record choices.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Listen for click events on the record choices.

*/
var recordChoicesButtons = () => {
    // Define the buttons for all record choices.
    const categoryAnime = document.getElementById("categoryAnime"),
        categoryBook = document.getElementById("categoryBook"),
        categoryFilm = document.getElementById("categoryFilm"),
        categoryManga = document.getElementById("categoryManga"),
        categoryShow = document.getElementById("categoryShow"),
        clearAssociations = document.getElementById("clearAssociations");
    // Define the relevant portions of the page that are in the rotation of record forms.
    const directionsTitle = document.getElementById("directionsTitle"),
        directionsText = document.getElementById("directionsText"),
        categoryDivs = document.getElementsByClassName("categoryDiv"),
        categoryLinks = document.getElementsByClassName("categoryLink"),
        categoryInitial = document.getElementById("categoryInitial"),
        categoryAnimeDiv = document.getElementById("categoryAnimeDiv"),
        categoryBookDiv = document.getElementById("categoryBookDiv"),
        categoryFilmDiv = document.getElementById("categoryFilmDiv"),
        categoryMangaDiv = document.getElementById("categoryMangaDiv"),
        categoryShowDiv = document.getElementById("categoryShowDiv"),
        updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none";
    // Define the color which will be applied to the favorite image icon.
    const btnColorFavorite = getComputedStyle(document.getElementById("categorySelection").parentNode.parentNode).backgroundColor;
    let introAnimeHolder = false,
        introBookHolder = false,
        introFilmHolder = false,
        introMangaHolder = false,
        introShowHolder = false;
    ipcRenderer.on("addIntroduction", event => {
        introAnimeHolder = true;
        introBookHolder = true;
        introFilmHolder = true;
        introMangaHolder = true;
        introShowHolder = true;
    });
    // Listen for a click event on the clear all associations button to remove all associations.
    clearAssociations.addEventListener("click", e => {
        document.getElementById("associationsCollection").innerHTML = "";
    });
    // Listen for a click event on the categoryAnime button on the top bar to display the form corresponding to an anime record.
    categoryAnime.addEventListener("click", e => {
        e.preventDefault();
        // Reset the associations.
        clearAssociations.click();
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
            const jnameInput = document.getElementById("animeJapaneseName"),
                studioInput = document.getElementById("animeStudio"),
                directorsInput = document.getElementById("animeDirectors"),
                producersInput = document.getElementById("animeProducers"),
                writersInput = document.getElementById("animeWriters"),
                musicInput = document.getElementById("animeMusicians");
            updateFetchedDataString(jnameInput, newResponse[1], updateDetector);
            setFetchedImages("Anime", btnColorFavorite, newResponse[2]);
            updateFetchedDataString(studioInput, newResponse[8].join(", "), updateDetector);
            updateFetchedDataString(directorsInput, newResponse[9].join(", "), updateDetector);
            updateFetchedDataString(producersInput, newResponse[10].join(", "), updateDetector);
            updateFetchedDataString(writersInput, newResponse[11].join(", "), updateDetector);
            updateFetchedDataString(musicInput, newResponse[12].join(", "), updateDetector);
            updateFetchedDataTextArea(animeSynopsis, newResponse[13], updateDetector);
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
                    animeSeasonAddition();
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
                    animeSingleAddition();
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
        introAnimeHolder = introInit(introAnimeHolder, document.getElementById("introductionTargetAnimeSave"), document.getElementById("introductionTargetAnimeOptions"));
    });
    // Listen for a click event on the categoryBook button on the top bar to display the form corresponding to a book record.
    categoryBook.addEventListener("click", e => {
        e.preventDefault();
        // Reset the associations.
        clearAssociations.click();
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
            const bookTitle = document.getElementById("bookTitle"),
                bookOriginalTitle = document.getElementById("bookOriginalTitle"),
                bookISBN = document.getElementById("bookISBN"),
                bookAuthor = document.getElementById("bookAuthor"),
                bookPublisher = document.getElementById("bookPublisher"),
                bookPublicationDate = document.getElementById("bookPublicationDate"),
                bookPages = document.getElementById("bookPages");
            updateFetchedDataString(bookTitle, newResponse[0], updateDetector, true);
            updateFetchedDataString(bookOriginalTitle, newResponse[1], updateDetector);
            setFetchedImages("Book", btnColorFavorite, [newResponse[2], [newResponse[2]]]);
            updateFetchedDataString(bookISBN, String(newResponse[3]), updateDetector, false, formatISBN);
            updateFetchedDataString(bookAuthor, newResponse[4], updateDetector);
            updateFetchedDataString(bookPublisher, newResponse[5], updateDetector);
            updateFetchedDataDate(bookPublicationDate, newResponse[6], updateDetector);
            updateFetchedDataString(bookPages, String(newResponse[7]), updateDetector);
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
            updateFetchedDataTextArea(bookSynopsis, newResponse[9], updateDetector);
            textAreaFunc(bookSynopsis);
            // Update the book genres if available.
            genreFill("Book", newResponse[10]);
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            bookPreloader.style.visibility = "hidden";
            bookFetchBtn.style.visibility = "visible";
            bookSave.style.visibility = "visible";
            initSelect();
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        introBookHolder = introInit(introBookHolder, document.getElementById("introductionTargetBookSave"), document.getElementById("introductionTargetBookAssociations"));
    });
    // Listen for a click event on the categoryFilm button on the top bar to display the form corresponding to a film record.
    categoryFilm.addEventListener("click", e => {
        e.preventDefault();
        // Reset the associations.
        clearAssociations.click();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryFilmDiv, categoryFilm);
        // Display the correct input associated to the film other genres/tags.
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
        // Listen for changes in the film description in order to hide/show a vertical scroll.
        filmSynopsis.addEventListener("input", e => textAreaFunc(filmSynopsis));
        // Listen for changes in the film comments/review in order to hide/show a vertical scroll.
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
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none",
                filmName = document.getElementById("filmName"),
                filmAlternateName = document.getElementById("filmAlternateName"),
                filmReleaseDate = document.getElementById("filmReleaseDate"),
                directorsInput = document.getElementById("filmDirectors"),
                writersInput = document.getElementById("filmWriters"),
                distributorsInput = document.getElementById("filmDistributors"),
                producersInput = document.getElementById("filmProducers"),
                productionCompaniesInput = document.getElementById("filmProductionCompanies"),
                starsInput = document.getElementById("filmStarring");
            updateFetchedDataString(filmName, newResponse[0], updateDetector, true);
            updateFetchedDataString(filmAlternateName, newResponse[1], updateDetector);
            setFetchedImages("Film", btnColorFavorite, newResponse[2]);
            updateFetchedDataDate(filmReleaseDate, newResponse[3], updateDetector);
            updateFetchedDataString(filmRunTimeInput, formatRunningTime(newResponse[4]), updateDetector);
            updateFetchedDataString(directorsInput, newResponse[6].join(", "), updateDetector);
            updateFetchedDataString(writersInput, newResponse[7].join(", "), updateDetector);
            updateFetchedDataString(distributorsInput, newResponse[8].join(", "), updateDetector);
            updateFetchedDataString(producersInput, newResponse[9].join(", "), updateDetector);
            updateFetchedDataString(productionCompaniesInput, newResponse[10].join(", "), updateDetector);
            updateFetchedDataString(starsInput, newResponse[11].join(", "), updateDetector);
            updateFetchedDataTextArea(filmSynopsis, newResponse[12], updateDetector);
            // Update the film genres if available.
            genreFill("Film", newResponse[5]);
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            filmPreloader.style.visibility = "hidden";
            filmMoreBtn.style.visibility = "visible";
            filmFetchBtn.style.visibility = "visible";
            filmSave.style.visibility = "visible";
            initSelect();
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        introFilmHolder = introInit(introFilmHolder, document.getElementById("introductionTargetFilmSave"), document.getElementById("introductionTargetFilmAssociations"));
    });
    // Listen for a click event on the categoryManga button on the top bar to display the form corresponding to a manga record.
    categoryManga.addEventListener("click", e => {
        e.preventDefault();
        // Reset the associations.
        clearAssociations.click();
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
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none",
                jnameInput = document.getElementById("mangaJapaneseName"),
                mangaStartDate = document.getElementById("mangaStartDate"),
                mangaEndDate = document.getElementById("mangaEndDate"),
                writersInput = document.getElementById("mangaWriters");
            updateFetchedDataString(mangaName, newResponse[0], updateDetector);
            updateFetchedDataString(jnameInput, newResponse[1], updateDetector);
            setFetchedImages("Manga", btnColorFavorite, newResponse[2]);
            updateFetchedDataDate(mangaStartDate, newResponse[3], updateDetector);
            updateFetchedDataDate(mangaEndDate, newResponse[4], updateDetector);
            updateFetchedDataString(writersInput, newResponse[8].map(writer => writer.split(", ").reverse().join(" ")).join(", "), updateDetector);
            updateFetchedDataTextArea(mangaSynopsis, newResponse[9], updateDetector);
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
        introShowHolder = introInit(introMangaHolder, document.getElementById("introductionTargetMangaSave"), document.getElementById("introductionTargetMangaOptions"));
    });
    // Listen for a click event on the categoryShow button on the top bar to display the form corresponding to a show record.
    categoryShow.addEventListener("click", e => {
        e.preventDefault();
        // Reset the associations.
        clearAssociations.click();
        // Reset the top nav accordingly.
        navReset(categoryInitial, categoryDivs, categoryLinks, categoryShowDiv, categoryShow);
        // Display the correct input associated to the show other genres/tags.
        otherGenresReset("Show");
        // Initialize the dragging of the related content.
        dragInit("Show");
        // Define all image buttons.
        const showPreviousImgBtn = document.getElementById("showPreviousImgBtn"),
            showAddImgBtn = document.getElementById("showAddImgBtn"),
            showAddImgInput = document.getElementById("showAddImgInput"),
            showRemoveImgBtn = document.getElementById("showRemoveImgBtn"),
            showNextImgBtn = document.getElementById("showNextImgBtn"),
            addRecordShowImg = document.getElementById("addRecordShowImg"),
            showFavoriteImageLink = document.getElementById("showFavoriteImageLink");
        imgButtons(showFavoriteImageLink, showPreviousImgBtn, showAddImgBtn, showAddImgInput, showRemoveImgBtn, showNextImgBtn, addRecordShowImg, btnColorFavorite);
        // Define the portions of the page associated to the autocomplete.
        const showName = document.getElementById("showName"),
            showPreloader = document.getElementById("showPreloader"),
            showNameAutocomplete = autoCompleteInit("Show", showName, showPreloader),
            showNameUL = showName.nextElementSibling,
            showMoreBtn = document.getElementById("showMoreDetailsBtn"),
            showFetchBtn = document.getElementById("showFetchDetailsBtn"),
            showSave = document.getElementById("showSave"),
            showSynopsis = document.getElementById("showSynopsis"),
            showReview = document.getElementById("showReview"),
            showRunTimeInput = document.getElementById("showRunningTime");
        // Listen for changes in the show description in order to hide/show a vertical scroll.
        showSynopsis.addEventListener("input", e => textAreaFunc(showSynopsis));
        // Listen for changes in the show comments/review in order to hide/show a vertical scroll.
        showReview.addEventListener("input", e => textAreaFunc(showReview));
        // Listen for a click event on the fetch details button in order to display a preloader and send a request to the back-end for data.
        showFetchBtn.addEventListener("click", e => nameFetchFunc("Show", showName, showPreloader));
        // Define the autocomplete previous input and character max count for display purposes.
        let previousName = "";
        // Listen for an input change in the show name in order to fetch autocomplete options from imdb.
        showName.addEventListener("input", e => previousName = nameAutoCompleteFunc("Show", e.target, previousName, showNameAutocomplete, true));
        // Listen for a click event on the show name in order to trigger a fetch of autocomplete options from imdb.
        showName.addEventListener("click", e => nameAutoCompleteFunc("Show", e.target, previousName, showNameAutocomplete, false));
        // Provide the autocomplete listener associated to show records.
        autoCompleteListener("Show", showName, showNameUL, showNameAutocomplete);
        showRunTimeInput.addEventListener("input", e => e.target.value = formatRunningTime(e.target.value));
        // Update the page accordingly based on the fetched show details.
        ipcRenderer.on("showFetchDetailsResult", (newEve, newResponse) => {
            const updateDetector = document.getElementById("categorySelection").parentNode.parentNode.parentNode.style.display == "none",
                showName = document.getElementById("showName"),
                showAlternateName = document.getElementById("showAlternateName"),
                showReleaseDate = document.getElementById("showReleaseDate"),
                directorsInput = document.getElementById("showDirectors"),
                writersInput = document.getElementById("showWriters"),
                distributorsInput = document.getElementById("showDistributors"),
                producersInput = document.getElementById("showProducers"),
                productionCompaniesInput = document.getElementById("showProductionCompanies"),
                starsInput = document.getElementById("showStarring");
            updateFetchedDataString(showName, newResponse[0], updateDetector, true);
            updateFetchedDataString(showAlternateName, newResponse[1], updateDetector);
            setFetchedImages("Show", btnColorFavorite, newResponse[2]);
            updateFetchedDataDate(showReleaseDate, newResponse[3], updateDetector);
            updateFetchedDataString(showRunTimeInput, formatRunningTime(newResponse[4]), updateDetector);
            updateFetchedDataString(directorsInput, newResponse[6].join(", "), updateDetector);
            updateFetchedDataString(writersInput, newResponse[7].join(", "), updateDetector);
            updateFetchedDataString(distributorsInput, newResponse[8].join(", "), updateDetector);
            updateFetchedDataString(producersInput, newResponse[9].join(", "), updateDetector);
            updateFetchedDataString(productionCompaniesInput, newResponse[10].join(", "), updateDetector);
            updateFetchedDataString(starsInput, newResponse[11].join(", "), updateDetector);
            updateFetchedDataTextArea(showSynopsis, newResponse[12], updateDetector);
            // Update the show genres if available.
            genreFill("Show", newResponse[5]);
            // Hide the preloader now that everything has been loaded and show the buttons if necessary.
            showPreloader.style.visibility = "hidden";
            showMoreBtn.style.visibility = "visible";
            showFetchBtn.style.visibility = "visible";
            showSave.style.visibility = "visible";
            initSelect();
        });
        // If the page load corresponded to the continuation of the application tutorial then provide the tutorial steps on the addRecord page.
        introShowHolder = introInit(introShowHolder, document.getElementById("introductionTargetShowSave"), document.getElementById("introductionTargetShowOptions"));
    });
};