<h1 align="center">Trak</h1>

Trak is the one-stop application designed for cataloging all content read and watched. In order to install for use simply download the package for your operating system in the releases.


## Why?

This application was motivated by the simple thought that there is no such dedicated app out there. A typical user will find themselves creating a sheet in order to keep track of content read and/or watched, but this is not visually appealing and can become cumbersome depending on the size of the library. On the other hand using a website solves this, but depends upon a platform that can be offline all the while pushing advertisements on the user. While there are many features that can be motivated from a website service this application maintains all data locally. 


## Future Features

The following is a list of features that are in the plans for future releases:
* Application Logo
* Addition/Export/Import/Removal/Update of Book, Film, Manga, and Show Records
* Addition/Removal/Update of Record Associations
	* A record association is meant to link two or more items across multiple categories. In example, an anime can typically be associated to light novels and manga. 
* Update the index page search bar.
	* Currently the search bar searches only by name. It would be nice to have a search bar that can perform a search based on other details associated to a record.
* Design a notification system that can update the user on any record that has an upcoming release date.
* Create application splash screen.
* Create a separate page that will allow a user to search for anime by season.


## Application Files

There are six locations for files created by the use of the application. Depending on the operating system all (by default) will be in one of the following:
```
C:\Users\username\AppData\Roaming\Trak\
/home/username/.local/share/Trak/
```
where 'username' has to be replaced.
* Under the "config" folder there will be three files titled configuration.json, location.json, and tutorial.json. These contain the settings parameters, application installation location, and the application tutorial load.
* Under the "data" folder all user records are contained. In the application settings this directory can be changed if the user desires for the data to be saved elsewhere.
* Under the "localPages" folder will be the application html files reproduced by the application on launch. In order to avoid having to ask for administrator privileges the application creates new html files locally after modifying them. The modifications occuring correspond to changing the href values of the css and js files.
* Under the "localStyles" folder will be the application css file reproduced by the application on launch. In order to avoid having to ask for administrator privileges the application creates new css file locally after modifying it. The modifications occuring correspond to changing the primary and secondary color values.
* Under the "exportTemp" folder files are generated and removed during an application library export.
* Under the "importTemp" folder files are generated and removed during an application library import.