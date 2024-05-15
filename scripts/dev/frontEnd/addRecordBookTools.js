/*

BASIC DETAILS: This file provides front-end functions designed to be used by the addRecord.html page with a focus on book records.

    - bookSaveFunc: Driver function for saving a book record.

*/



/*---------------------------------------------------------------------------------------------------------------------*/



/*

Driver function for saving a book record.

   - auto is a boolean corresponding to whether the save action is a user submission or the application auto saving.

*/
var bookSaveFunc = (auto = false) => {
    // Define the page components which will contain all associated details.
    const bookBookmarkValue = document.getElementById("bookBookmark").children[0].textContent == "check_box",
        bookTitle = document.getElementById("bookTitle").value,
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
            [document.getElementById("addRecordAnimeImg").getAttribute("list") == document.getElementById("addRecordAnimeImg").getAttribute("previous"), bookImg],
            bookBookmarkValue, [oldISBN, oldTitle]];
        ipcRenderer.send("performSave", [document.getElementById("addRecordsNav").style.display == "none" ? true : false, submissionMaterial, auto]);
        saveAssociations("Book", bookTitle, ipcRenderer);
    }
    // If no ISBN has been provided then notify the user.
    else { M.toast({"html": "A book record requires that an ASIN/ISBN be provided.", "classes": "rounded"}); }
};