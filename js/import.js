
//? static variables
const API_KEY = "AIzaSyDwEZp1cw0ZkBI1_MYcyytP_QdGecNeJs8";
const CLIENT_ID = "31776270873-fkv22r84v2fsm6ro8jlg3mfhik4e5pa1.apps.googleusercontent.com";
const API_LOAD = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";
const MAX_RESULTS = 50;

//? needed elements from DOM in import.html
var toPlaylist = document.querySelector('#to-playlist');
var toSong = document.querySelector('#to-song');
var forPlaylistForm = document.querySelector('#for-playlist-form');
var forSongForm = document.querySelector('#for-song-form');
var forPlaylistBlock = document.querySelector('#for-playlist-block');
var forSongBlock = document.querySelector('#for-song-block');
var forPlaylistContent = document.querySelector('#for-playlist-content');
var forSongContent = document.querySelector('#for-song-content');
var resultDiv = document.querySelector('#result');
var songList = document.querySelector('#songs-list');
var singleSongList = document.querySelector('#single-songs-list');
var switchBlock = document.querySelector('#switch-block');
var switchCheck = document.querySelector('#switch-check');
var playlistHeaderTitle = document.querySelector('#playlist-title-text-scrolled');
var songIdsImported = [], songDurations = [], playlist, playlistDuration, songItemsToUpload = [], songItems = [];

//? initialize google cloud client
gapi.load("client:auth2", function () {
   gapi.auth2.init({ client_id: CLIENT_ID });
});

//? load api
function loadClient() {
   gapi.client.setApiKey(API_KEY);
   return gapi.client.load(API_LOAD)
      .then(function () { console.log("GAPI client loaded for API"); },
         function (err) { console.error("Error loading GAPI client for API", err); });
}
function authenticate() {
   return gapi.auth2.getAuthInstance()
      .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
      .then(function () { console.log("Sign-in successful"); },
         function (err) { console.error("FUCK!!!", err); });
}

//? get playlistID 
function getPlaylistId() {
   const regex = /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/playlist\?list=([A-Za-z0-9_-]+)/;
   var url = String(document.querySelector('#playlistId').value);
   if (!url) {
      showMessage('Please, enter a playlist link from YouTube Music.', 'warning');
      return false;
   }
   const match = url.match(regex);
   document.querySelector('#playlistId').value = '';
   if (match && match[1]) {
      if (match[1].length === 43) {
         showMessage(`Oops, an error occurred. Check whether the playlist is not created by YouTube.`, 'error')
         return false;
      }
      return match[1];
   } else {
      showMessage('Please, enter a playlist link from YouTube Music.', 'error');
      return false;
   }
}

//? get songID 
function getSongId() {

   const regex = /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/;
   var url = String(document.querySelector('#songId').value);
   const match = url.match(regex);
   if (!url) {
      showMessage('Please, enter a song link from YouTube Music.', 'warning');
      return false;
   }
   document.querySelector('#songId').value = '';
   if (match && match[1]) {
      return match[1];
   } else {
      showMessage('Please, enter a song link from YouTube Music.', 'error');
      return false;
   }
}

//? fetches single song
function fetchSong() {

   //? get song id
   var songId = getSongId();
   console.log(songId)
   if (!songId) {
      console.error('The song link must be from YouTube Music.');
      return;
   }

   //? showpreloader
   showImportPreloader();

   //? the playing playing isn't last imported after importing one other
   isLastImported = false;

   songSingleItem = [];
   songDurations = [];

   //? hide result block for preloader
   forSongContent.classList.add('hidden');
   singleSongList.innerHTML = '';

   //? set initial songs amount
   songCounter = 0;

   //? get playlist info
   gapi.client.youtube.videos.list({
      "part": [
         "snippet",
         "contentDetails",
      ],
      "id": [
         songId,
      ]
   })
      .then(function (response) {
         //? 1st item from array of songs 
         var song = response.result.items[0];
         if (song === undefined) {

            //? hide preloader
            hideImportPreloader();

            //? show an error
            showMessage(`The song couldn't be found.`, 'error')
            return
         }

         //? convert song duratoin into mm:ss format
         returnedDuration = song.contentDetails.duration;
         convertedDuration = convertISO8601ToDuration(returnedDuration);
         seconds = ("0" + convertedDuration.seconds).slice(-2);
         hours = convertedDuration.hours !== 0 ? convertedDuration.hours + ':' : '';
         duration = hours + convertedDuration.minutes + ":" + seconds;
         songDurations.push(duration);

         //? push object of song data to array songSingleItem
         songImgMedium = song.snippet.thumbnails.medium.url;
         songImgMaxres = song.snippet.thumbnails.hasOwnProperty('maxres') ? song.snippet.thumbnails.maxres.url : null;
         songSingleItem.push({
            id: song.id,
            title: song.snippet.title,
            author: song.snippet.channelTitle,
            img: {
               medium: songImgMedium,
               maxres: songImgMaxres
            },
         });

         //? hide preloader
         hideImportPreloader();

         showMessage('The song was successfully imported!', 'success');

         //? show result block
         showSongData(song, songDurations, true);
         forSongContent.classList.remove('hidden');

      },
         function (err) {
            console.error("Execute error", err);
         })
}

let songCounter = 0;
//? fetch playlist
function fetchPlaylist() {

   //? get inserted playlist's ID
   var playlistId = getPlaylistId();
   if (!playlistId) {
      console.error('The playlist link must be from YouTube Music.');
      return;
   }

   //? showpreloader
   showImportPreloader();

   //? the playing playing isn't last imported after importing one other
   isLastImported = false;

   songItems = [];
   songDurations = [];
   playlistDuration = 0;
   forPlaylistContent.classList.add('hidden');
   songList.innerHTML = '';

   //? DOM elemenst for inserting info about playlist
   var playlistThumbnailElement = document.getElementById('playlist-thumbnail');
   var playlisBackground = document.getElementById('playlist-background-img');
   var playlistTitleElement = document.getElementById('playlist-title-text');
   var playlistAuthorElement = document.getElementById('playlist-author');

   //? set initial songs amount
   songCounter = 0;

   //? get playlist info
   gapi.client.youtube.playlists.list({
      "part": [
         "snippet",
         "contentDetails"
      ],
      "id": [
         playlistId,
      ]
   })
      .then(function (response) {
         if (response.result.pageInfo.totalResults === 0) {

            //? hide preloader
            hideImportPreloader();

            //? show an error
            showMessage(`The playlist couldn't be found. Check whether the playlist is not private.`, 'error')
            return
         }

         //? 1st item from array of playlist 
         playlist = response.result.items[0];
         playlistImg = playlist.snippet.thumbnails.hasOwnProperty('maxres') ? playlist.snippet.thumbnails.maxres.url : playlist.snippet.thumbnails.medium.url;

         //? get data from array
         playlistThumbnailElement.src = playlisBackground.src = playlistImg
         playlistTitleElement.innerHTML = playlistHeaderTitle.innerHTML = `<p>${playlist.snippet.title}</p>`;
         playlistAuthorElement.textContent = playlist.snippet.channelTitle;

      },
         function (err) {
            console.error("Execute error", err);
            showMessage(err, 'error')
         })
      .then(() => {
         //? fetch songs from the playlist
         fetchSongs(playlistId);
      })
}

//? fetches songs from defined playlist
function fetchSongs(playlistId, nextPageToken = '') {
   gapi.client.youtube.playlistItems.list({
      "part": [
         "snippet",
         "status",
      ],
      "playlistId": playlistId,
      "maxResults": MAX_RESULTS,
      "pageToken": nextPageToken,
   })
      .then(function (response) {
         //? array of songs
         var songs = response.result.items;
         let songIdArray = [];
         let newNextPageToken = response.result.nextPageToken;


         //? get songs ids
         songs.forEach(song => {
            //? if song is available on YT
            if (song.status.privacyStatus != "unlisted" && song.status.privacyStatus != "privacyStatusUnspecified") {
               songId = song.snippet.resourceId.videoId;
               songIdArray.push(songId);
               songIdsImported.push(songId);
            }
         });

         //? get songs durations
         gapi.client.youtube.videos.list({
            "part": [
               "contentDetails",
               "snippet",
            ],
            "id": songIdArray,
         })
            .then(function (response) {
               var songsForDurations = response.result.items;
               songsForDurations.forEach(song => {
                  returnedDuration = song.contentDetails.duration;
                  convertedDuration = convertISO8601ToDuration(returnedDuration);
                  seconds = ("0" + convertedDuration.seconds).slice(-2);
                  hours = convertedDuration.hours !== 0 ? convertedDuration.hours + ':' : '';
                  duration = hours + convertedDuration.minutes + ":" + seconds;
                  songDurations.push(duration);
                  playlistDuration += convertedDuration.totalSeconds;

                  //? push object of song data to array songItems
                  songImgMedium = song.snippet.thumbnails.medium.url;
                  songImgMaxres = song.snippet.thumbnails.hasOwnProperty('maxres') ? song.snippet.thumbnails.maxres.url : null;
                  songItems.push({
                     id: song.id,
                     title: song.snippet.title,
                     author: song.snippet.channelTitle,
                     img: {
                        medium: songImgMedium,
                        maxres: songImgMaxres
                     },
                  });
               })

               //? initiate object of data to return
               var objectToReturn = {
                  songs: songs,
                  songDurations: songDurations,
                  newNextPageToken: newNextPageToken,
               }

               return objectToReturn;
            },
               function (err) { console.error("Execute error", err); })
            .then((objectReceived) => {

               //? get data from object
               songs = objectReceived.songs;
               songDurations = objectReceived.songDurations;
               newNextPageToken = objectReceived.newNextPageToken;


               //? show songs data
               songs.forEach(song => {
                  if (song.status.privacyStatus != "unlisted" && song.status.privacyStatus != "privacyStatusUnspecified") {
                     showSongData(song, songDurations);
                  }
               });
               return newNextPageToken ? newNextPageToken : null;
            })
            .then((nextPageToken) => {
               if (nextPageToken != null) {
                  fetchSongs(playlistId, nextPageToken); //? recall function utill it gets last page of results from YT API
               } else {

                  //? hide preloader
                  hideImportPreloader()

                  //? show results
                  forPlaylistContent.classList.remove('hidden');

                  showMessage('The playlist was successfully imported!', 'success');

                  textScrollAnimation(playlistHeaderTitle);

                  //? show songs amount
                  var playlistSongCountElement = document.getElementById('playlist-song-add_details');
                  playlistSongCountElement.textContent = songCounter + " songs";
                  playlistSongCountInYT = playlist.contentDetails.itemCount;
                  playlistDurationHours = Math.floor(playlistDuration / 3600) != 0 ? Math.floor(playlistDuration / 3600) + ' hours, ' : '';
                  playlistDurationMinutes = Math.floor(playlistDuration % 3600 / 60) != 0 ? Math.floor(playlistDuration % 3600 / 60) + ' minutes ' : '';
                  if (playlistSongCountInYT !== songCounter) {
                     playlistSongCountElement.textContent += ' (some songs are unavailable)'
                  }
                  playlistSongCountElement.innerHTML += ' • ' + playlistDurationHours + playlistDurationMinutes;
               }
            })
      },
         function (err) {
            console.log("Oops: ", err);
         })
}

//! song variable must be a json response from YT API
function showSongData(song, songDurationsArray = [], singleSong = false) {
   let songOwner;
   if (!singleSong) {
      songId = song.snippet.resourceId.videoId;
      songOwner = song.snippet.videoOwnerChannelTitle;
      withdrawTo = songList;
      songShelfId = songCounter + 1;
   } else {
      songId = song.id;
      songOwner = song.snippet.channelTitle;
      withdrawTo = singleSongList;
      songShelfId = 'single';
   }

   //? get song's info
   songTitle = song.snippet.title;
   songImg = song.snippet.thumbnails.medium.url;
   songDuration = songDurationsArray[songCounter];

   //? create div for song info
   var songBlock = document.createElement('div');
   songBlock.classList.add('song-shelf', 'grid-template-columns');
   songBlock.setAttribute('id', `song-shelf-${songShelfId}`);
   songBlock.innerHTML = `
   <div class="song-index song-field">
     <div class="icon__container-16">
      <svg class="hidden" id="play-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
         <g clip-path="url(#clip0_851_5)">
            <path fill-rule="evenodd" clip-rule="evenodd"
               d="M1.56356 1.51977C1.59419 1.25356 1.68501 0.998372 1.82877 0.774522C1.97254 0.550672 2.16529 0.364348 2.39167 0.23039C2.61804 0.0964323 2.87179 0.0185426 3.13269 0.00292479C3.3936 -0.012693 3.65446 0.0343926 3.89449 0.140431C5.10795 0.672477 7.82737 1.93697 11.2781 3.9796C14.7299 6.0234 17.1579 7.80822 18.2126 8.61801C19.113 9.3106 19.1152 10.6841 18.2137 11.379C17.1694 12.1841 14.771 13.9455 11.2781 16.0151C7.78166 18.0847 5.09423 19.3339 3.89221 19.8589C2.857 20.3125 1.69839 19.6246 1.56356 18.4796C1.40588 17.1413 1.11108 14.1025 1.11108 9.99851C1.11108 5.89684 1.40474 2.85926 1.56356 1.51977Z"
               fill="black" fill-opacity="1" />
         </g>
         <defs>
            <clipPath id="clip0_851_5">
               <rect width="20" height="20" fill="white" />
            </clipPath>
         </defs>
      </svg>
      <svg class="hidden" id="playing-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
         <path d="M12.95 7.05006C13.7311 7.83143 14.17 8.89105 14.17 9.9959C14.17 11.1007 13.7311 12.1604 12.95 12.9417M15.8917 4.1084C17.4539 5.67113 18.3316 7.79036 18.3316 10.0001C18.3316 12.2098 17.4539 14.329 15.8917 15.8917M9.16669 4.16673L5.00002 7.50006H1.66669V12.5001H5.00002L9.16669 15.8334V4.16673Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="hidden" id="pause-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
         <path d="M5.95 0H3.975C3.4512 0 2.94885 0.210714 2.57846 0.585786C2.20808 0.960859 2 1.46957 2 2V18C2 18.5304 2.20808 19.0391 2.57846 19.4142C2.94885 19.7893 3.4512 20 3.975 20H5.95C6.4738 20 6.97615 19.7893 7.34654 19.4142C7.71692 19.0391 7.925 18.5304 7.925 18V2C7.925 1.46957 7.71692 0.960859 7.34654 0.585786C6.97615 0.210714 6.4738 0 5.95 0ZM15.825 0H13.85C13.3262 0 12.8238 0.210714 12.4535 0.585786C12.0831 0.960859 11.875 1.46957 11.875 2V18C11.875 18.5304 12.0831 19.0391 12.4535 19.4142C12.8238 19.7893 13.3262 20 13.85 20H15.825C16.3488 20 16.8512 19.7893 17.2215 19.4142C17.5919 19.0391 17.8 18.5304 17.8 18V2C17.8 1.46957 17.5919 0.960859 17.2215 0.585786C16.8512 0.210714 16.3488 0 15.825 0Z" fill="black"/>
      </svg>
      </div>
      <span id="index">${songCounter + 1}</span>
   </div>
   <div class="song-img song-field">
      <img src="${songImg}" alt="">
   </div>
   <div class="song-title song-field">
      ${songTitle}
   </div>
   <div class="song-author song-field">
      ${songOwner}
   </div>
   <div class="song-additional-data song-field column-last">
      <span class="song-duration" id="song-duration">
         ${songDuration}
      </span>
   </div>`;

   //? withdraw song to song list
   withdrawTo.insertAdjacentElement('beforeend', songBlock);

   //? go to clicked song's player
   songBlock = document.getElementById(`song-shelf-${songShelfId}`);

   songBlock.addEventListener('click', (e) => {
      //? indentidicate which array with songs must be uploaded to the local storage
      songItemsToUpload = singleSong ? songSingleItem : songItems;

      //? now we're playing the imported playlist
      isLastImported = true;
      //? send the array of yt video IDs to local storage
      songItemsInLocalStorage = localStorage.getItem('songItems');
      if (JSON.stringify(songItemsInLocalStorage) != songItemsToUpload) {
         localStorage.removeItem('songItems');
         localStorage.setItem('songItems', JSON.stringify(songItemsToUpload));
      }
      if (!songBlock.classList.contains('playing')) {
         let index = songBlock.getAttribute('id').replace('song-shelf-', '');
         updateSwiper = true;
         console.log(updateSwiper)
         loadSong(index, 'out of order');
      }
   })

   //? show play icon on hover 
   songBlock.addEventListener('mouseover', (e) => {
      if (!songBlock.classList.contains('playing') || songBlock.classList.contains('paused')) {
         index = songBlock.querySelector('#index')
         playIcon = songBlock.querySelector('#play-icon')
         index.classList.add('hidden')
         playIcon.classList.remove('hidden')
      } else {
         playingIcon = songBlock.querySelector('#playing-icon')
         activeIcon = songBlock.querySelector('.active-icon')
         playingIcon.classList.add('hidden')
         activeIcon.classList.remove('hidden')
      }
   })

   songBlock.addEventListener('mouseout', () => {
      if (!songBlock.classList.contains('playing') || songBlock.classList.contains('paused')) {
         index = songBlock.querySelector('#index')
         playIcon = songBlock.querySelector('#play-icon')
         index.classList.remove('hidden')
         playIcon.classList.add('hidden')
      } else {
         playingIcon = songBlock.querySelector('#playing-icon')
         activeIcon = songBlock.querySelector('.active-icon')
         playingIcon.classList.remove('hidden')
         activeIcon.classList.add('hidden')
      }
   })

   //? increment song counter by 1
   songCounter++;
}

toSong.addEventListener('click', (e) => {
   if (document.body.clientWidth <= 576) {
      toPlaylist.classList.remove('hidden');
      toSong.classList.add('hidden');
   }
   forPlaylistBlock.classList.toggle('hidden');
   forSongBlock.classList.toggle('hidden');
   forPlaylistForm.classList.toggle('hidden');
   forSongForm.classList.toggle('hidden');
   switchBlock.classList.toggle('checked');
})
toPlaylist.addEventListener('click', (e) => {
   if (document.body.clientWidth <= 576) {
      toPlaylist.classList.add('hidden');
      toSong.classList.remove('hidden');
   }
   forPlaylistBlock.classList.toggle('hidden');
   forSongBlock.classList.toggle('hidden');
   forPlaylistForm.classList.toggle('hidden');
   forSongForm.classList.toggle('hidden');
   switchBlock.classList.toggle('checked');
})


function convertISO8601ToDuration(iso8601) {
   //? Define a regular expression to match ISO 8601 duration format
   const regex = /P(?:([\d.]+Y)?(?:([\d.]+M)?(?:([\d.]+D)?(?:T(?:([\d.]+H)?(?:([\d.]+M)?(?:([\d.]+S)?)?)?)?)?)?)?)/;
   //? Use the regular expression to parse the ISO 8601 duration string
   const match = regex.exec(iso8601);

   //? Check if the string does not match the expected format
   if (!match) {
      throw new Error('Invalid ISO 8601 duration format');
   }

   //? Extract individual components from the matched groups
   const years = parseFloat(match[1]) || 0;     // Years
   const months = parseFloat(match[2]) || 0;    // Months
   const days = parseFloat(match[3]) || 0;      // Days
   const hours = parseFloat(match[4]) || 0;     // Hours
   const minutes = parseFloat(match[5]) || 0;   // Minutes
   const seconds = parseFloat(match[6]) || 0;   // Seconds

   //? Calculate the total duration in seconds
   const totalSeconds = years * 365 * 24 * 60 * 60 +
      months * 30 * 24 * 60 * 60 +
      days * 24 * 60 * 60 +
      hours * 60 * 60 +
      minutes * 60 +
      seconds;

   //? Return an object containing individual components and the total duration
   return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
   };
}

const playlistInput = document.querySelector('#playlistId');
const songInput = document.querySelector('#songId');

window.addEventListener('resize', adaptToClientWidth)
adaptToClientWidth();

function adaptToClientWidth() {
   if (document.body.clientWidth <= 576) {
      if (switchBlock.classList.contains('checked')) {
         toPlaylist.classList.add('hidden')
      } else {
         toSong.classList.add('hidden')
      }
   } else {
      toSong.classList.remove('hidden')
      toPlaylist.classList.remove('hidden')
   }
   if (document.body.clientWidth <= 412) {
      playlistInput.placeholder = 'YT Music playlist link...';
      songInput.placeholder = 'YT Music song link...';
   } else {
      playlistInput.placeholder = 'Playlist link in YouTube Music...';
      songInput.placeholder = 'Song link in YouTube Music...';
   }
}