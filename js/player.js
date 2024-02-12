
//? init elements
const playPause = document.getElementById('playPause');
const sliderValume = document.getElementById('sliderValume');
const buttonValume = document.getElementById('volume-status');
const songBeginning = document.getElementById('songBeginning');
const nextSong = document.getElementById('nextSong');
const playbackPosition = document.getElementById('playback-position');
const playbackDuration = document.getElementById('playback-duration');
const sliderPlayback = document.getElementById('sliderPlayback');
const songDownload = document.getElementById('song-download');
const shuffleBtn = document.getElementById('shuffle-btn');
const playbackMode = document.getElementById('playbackMode');
const playerSongImg = document.getElementById('player-song-image').querySelector('img');
const playerSongTitle = document.getElementById('player-song-title');
const playerSongAuthor = document.getElementById('player-song-author');
const pageTitle = document.title;
const fullscreenPlayer = document.getElementById('fullscreen-player');
const footerPlayer = document.getElementById('footer-player');
const wrapper = document.querySelector('.wrapper');

//? fullscreen player's elements
const fullscreenPlayerPlayPause = document.getElementById('fullscreen-player-playPause');
const fullscreenPlayerSliderValume = document.getElementById('fullscreen-player-sliderValume');
const fullscreenPlayerButtonValume = document.getElementById('fullscreen-player-volume-status');
const fullscreenPlayerSongBeginning = document.getElementById('fullscreen-player-songBeginning');
const fullscreenPlayerNextSong = document.getElementById('fullscreen-player-nextSong');
const fullscreenPlayerPlaybackPosition = document.getElementById('fullscreen-player-playback-position');
const fullscreenPlayerPlaybackDuration = document.getElementById('fullscreen-player-playback-duration');
const fullscreenPlayerSliderPlayback = document.getElementById('fullscreen-player-sliderPlayback');
const fullscreenPlayerSongDownload = document.getElementById('fullscreen-player-song-download');
const fullscreenPlayerShuffleBtn = document.getElementById('fullscreen-player-shuffle-btn');
const fullscreenPlayerPlaybackMode = document.getElementById('fullscreen-player-playbackMode');
const fullscreenPlayerSongImg = document.getElementById('fullscreen-player-song-image');
const fullscreenPlayerBackgroundSongImg = document.getElementById('fullscreen-player-background-song-image');
const fullscreenPlayerSongTitle = document.getElementById('fullscreen-player-song-title');
const fullscreenPlayerSongAuthor = document.getElementById('fullscreen-player-song-author');


var player, time, videoDuration, settingPlaybackTime = false, setNewSong = true, songItems = [], isLoaded = false, spaceBetweenSlidesOnFSPlayer, swiper, updateSwiper = false, currentSongItem,
isLastImported = false; //? is the playing playlist the one that was imported the last time

//? init playlist player data object
var playSongs = localStorage.getItem('playSongs') ?
   JSON.parse(localStorage.getItem('playSongs')) :
   {
      prevSong: {
         index: 0,
         id: "",
      },
      currentSong: {
         index: 0,
         id: "",
      },
      nextSong: {
         index: 0,
         id: "",
      },
   }

//? init playlist player data object
var playerSettings =
{
   repeatMode: 'off',
   shuffle: 'off',
   volume: 100,
};


//? load YouTube Iframe API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


function onYouTubeIframeAPIReady() {
   if (localStorage.getItem('songItems') && localStorage.getItem('playSongs')) {
      songItems = JSON.parse(localStorage.getItem('songItems'));
      const currentSongIndex = playSongs.currentSong.index;
      loadSong(currentSongIndex, null, songItems, false);
   }
}

// function onYouTubeIframeAPIReady() 
var songLoaded = false;
function loadSong(currentSongIndex, optionOrder = null, songItems = null, autoplay = true) {

   //? set current song index for future operations with arrays
   currentSongItem = currentSongIndex == 'single' ? 0 : currentSongIndex - 1;
   currentSongIndex = currentSongIndex == 'single' ? currentSongIndex : currentSongIndex - 1;

   //? get song objects
   if (!songItems) {
      songItems = JSON.parse(localStorage.getItem('songItems'));
   }

   //? set current song's data to player 
   playerSongImg.src = songItems[currentSongItem].img.medium;
   playerSongTitle.innerHTML = `<p>${songItems[currentSongItem].title}</p>`;
   playerSongAuthor.innerHTML = `<p>${songItems[currentSongItem].author}</p>`;

   fullscreenPlayerBackgroundSongImg.src = songItems[currentSongItem].img.medium;
   fullscreenPlayerSongTitle.innerHTML = `<p>${songItems[currentSongItem].title}</p>`;
   fullscreenPlayerSongAuthor.innerHTML = `<p>${songItems[currentSongItem].author}</p>`;

   textScrollAnimation(playerSongTitle);
   textScrollAnimation(playerSongAuthor);
   textScrollAnimation(fullscreenPlayerSongTitle);
   textScrollAnimation(fullscreenPlayerSongAuthor);

   if (autoplay) document.getElementsByTagName("title")[0].innerText = songItems[currentSongItem].title + ' • ' + songItems[currentSongItem].author;

   //? set prev, current and next songs
   var songsOrder;
   if (playerSettings.shuffle == 'on' && songItems.length === 1) {
      setShuffle(); //? turn off suffle if single song's loaded
   }
   if (playerSettings.shuffle == 'on' && !optionOrder) {
      songsOrder = JSON.parse(localStorage.getItem('songsOrder'));
      setPlaySongs(currentSongIndex, songItems, songsOrder);
   } else if (playerSettings.shuffle == 'on' && optionOrder == 'out of order') {
      songsOrder = shuffleSongsIndexes(songItems.length, currentSongIndex);
      localStorage.setItem('songsOrder', JSON.stringify(songsOrder));
      setPlaySongs(currentSongIndex, songItems, songsOrder);
   } else {
      setPlaySongs(currentSongIndex, songItems);
   }

   //? set YT.player if doesn't exist
   if (!player) {
      player = new YT.Player('player', {
         height: '0',
         width: '0',
         videoId: playSongs.currentSong.id,
         playerVars: {
            'autoplay': autoplay,
            'playsinline': 1,
            'controls': 0,
            'fs': 0,
            'rel': 0,
         },
         events: {
            'onReady': onReadyPlayer,
            'onStateChange': onPlayerStateChange
         }
      });
   } else {
      player.loadVideoById(playSongs.currentSong.id);
   }

   if (isLastImported) activateSongShelf();


   sliderPlayback.style.background = 'var(--clr-progressbar-main)';
   fullscreenPlayerSliderPlayback.style.background = 'var(--clr-progressbar-fullscreenplayer)';
   sliderPlayback.value = fullscreenPlayerSliderPlayback.value = 0;
   songLoaded = true;

   if (updateSwiper && swiper) {
      swiper.destroy(true, false);
      document.querySelector('.swiper-wrapper').innerHTML = '';
   }
   if (!swiper || updateSwiper) {
      swiper = new Swiper('.fullscreen-player__song-imgs__slider', {
         on: {
            init: function () {
               var swiperWrapper = document.querySelector('.swiper-wrapper');
               if (songItems.length <= 1) {
                  swiperWrapper.style.transform = 'translate3d(0px,0,0)';
               }
            },
         },
         touchRatio: .5, //? sensitiveness
         touchAngle: 45, //? swipe max angle that will trigger slide changing
         spaceBetween: 64 * 2,
         lazyPreloadPrevNext: 2,
         virtual: {
            slides: (function () {
               let songImgs = [], songImg, songImgElem;
               for (let i = 0; i < songItems.length; i++) {
                  songImg = songItems[i].img.maxres ? songItems[i].img.maxres : songItems[i].img.medium;
                  songImgElem =
                 ` <div class="fullscreen-player__song-img-adjust" id="${i + 1}">
                     <img src="${songImg}" id="fullscreen-player-song-image" alt="" loading="lazy">
                     <div class="swiper-lazy-preloader"></div>
                  </div>`
                  songImgs.push(songImgElem);
               }
               return songImgs;
            }()),
         },
         initialSlide: playSongs.currentSong.index - 1,
         loop: songItems.length > 1 ? true : false,
         enabled: songItems.length > 1 ? true : false,
      });
      // ? load next song on changing slides to the next one
      swiper.on('slideNextTransitionEnd', function () {
         playNext(triggeredWithSlider = true);
      });
      //? load next song on changing slides to the prev one
      swiper.on('slidePrevTransitionEnd', function () {
         toSongBeginning(toPrevSong = true, triggeredWithSlider = true)
      });
      if (playerSettings.shuffle === 'on') {
         shuffleSlidesBasedOnOrder(songsOrder)
      }
      updateSwiper = false;
   }
}

//? Function to shuffle the order of slides in Swiper based on shuffledOrder
function shuffleSlidesBasedOnOrder(shuffledOrder) {
   var newData = shuffledOrder.map(function (index) {
      index--;
      return swiper.virtual.slides[index]; // Adjust for 1-based index 
   });

   //? Update the virtual slides with the  new data
   swiper.virtual.slides = newData;
   renderSwiperWithNewData(newData)
}

function renderSwiperWithNewData(newData = null) {
   if (swiper) {
      console.log('Destroy the existing Swiper instance')
      swiper.destroy(true, false); // Destroy the existing Swiper instance
      document.querySelector('.swiper-wrapper').innerHTML = ''
   }

   //? Initialize Swiper with the new data
   console.log('Initialize Swiper with the new data')
   if (newData) {
      console.log('Init shuffled slider')
      swiper = new Swiper('.fullscreen-player__song-imgs__slider', {
         on: {
            init: function () {
               var swiperWrapper = document.querySelector('.swiper-wrapper');
               if (songItems.length <= 1) {
                  swiperWrapper.style.transform = 'translate3d(0px,0,0)';
               }
            },
         },
         touchRatio: .5, //? sensitiveness
         touchAngle: 45, //? swipe max angle that will trigger slide changing
         spaceBetween: 64 * 2,
         lazyPreloadPrevNext: 2,
         virtual: {
            slides: (function () {
               let songImgs = [];
               for (let i = 0; i < songItems.length; i++) {
                  songImgs.push(newData[i]);
               }
               return songImgs;
            }()),
         },
         initialSlide: 0,
         loop: songItems.length > 1 ? true : false,
         enabled: songItems.length > 1 ? true : false,
      });
   } else {
      console.log('Init common slider')
      swiper = new Swiper('.fullscreen-player__song-imgs__slider', {
         on: {
            init: function () {
               var swiperWrapper = document.querySelector('.swiper-wrapper');
               if (songItems.length <= 1) {
                  swiperWrapper.style.transform = 'translate3d(0px,0,0)';
                  console.log('kasjdhfa2')
               }
            },
         },
         touchRatio: .5, //? sensitiveness
         touchAngle: 45, //? swipe max angle that will trigger slide changing
         spaceBetween: 64 * 2,
         lazyPreloadPrevNext: 2,
         virtual: {
            slides: (function () {
               let songImgs = [], songImg;
               for (let i = 0; i < songItems.length; i++) {
                  songImg = songItems[i].img.maxres ? songItems[i].img.maxres : songItems[i].img.medium;
                  songImgElem =
                     ` <div class="fullscreen-player__song-img-adjust" id="${i + 1}">
                     <img src="${songImg}" id="fullscreen-player-song-image" alt="" loading="lazy">
                     <div class="swiper-lazy-preloader"></div>
                  </div>`
                  songImgs.push(songImgElem);
               }
               return songImgs;
            }()),
         },
         initialSlide: playSongs.currentSong.index - 1,
         loop: songItems.length > 1 ? true : false,
         enabled: songItems.length > 1 ? true : false,
      });
   }

   // ? load next song on changing slides to the next one
   swiper.on('slideNextTransitionEnd', function () {
      playNext(triggeredWithSlider = true);
   });
   //? load next song on changing slides to the prev one
   swiper.on('slidePrevTransitionEnd', function () {
      toSongBeginning(toPrevSong = true, triggeredWithSlider = true)
   });

   //? Update the slides and initialize Swiper
   swiper.updateSlides(); //? Update the slides
   swiper.init(); //? Initialize Swiper
}


function onReadyPlayer() {
   getDuration();
   isLoaded = true;
}

function onPlayerStateChange(event) {
   console.log(event.data);
   if (event.data == -1) {
      //? to disable some features that will cause issues if song's not loaded completely
      isLoaded = false;
   } else if (event.data == 0) { //? ended
      // isPlaying = false;
      setNewSong = true;
      playPauseSong(true, true);
      clearInterval(intervalPlaybackTime);
      if (repeatMode == "one" || (songItems.length == 1 && repeatMode == "on")) {
         toSongBeginning();
      } else if ((repeatMode == "off" && playSongs.currentSong.index != songItems.length) || repeatMode == "on") {
         isPlaying = false;
         playNext();
      }
   } else if (event.data == 1) { //? playing   
      isLoaded = true;
      isPlaying = true;
      if (intervalPlaybackTime) {
         clearInterval(intervalPlaybackTime);
      }
      intervalPlaybackTime = setInterval(getCurrentPlaybackTime, 1000);
      if (!started) {
         var playIcon = document.getElementById('play-controller'),
            pauseIcon = document.getElementById('pause-controller'),
            fullscreenPlayerpPlayIcon = document.getElementById('fullscreen-player-play-controller'),
            fullscreenPlayerpPauseIcon = document.getElementById('fullscreen-player-pause-controller')
         playIcon.classList.add('hidden');
         pauseIcon.classList.remove('hidden');
         fullscreenPlayerpPlayIcon.classList.add('hidden');
         fullscreenPlayerpPauseIcon.classList.remove('hidden');
      }
   } else if (event.data == 2) { //? paused
      isPlaying = false;
   } else if (event.data == 3) { //? buffering
      getDuration();
   }
}

//? code for fullscreen player
let startY = null, moveY = null, startX = null, moveX = null, close = false, fingerMoved = false, maxAngleToClose = 45, moduleX = null, moduleY = null;
footerPlayer.addEventListener('touchend', (e) => {
   if (e.target.closest('#footer-player') && !e.target.closest('.player-controls-top') && !e.target.closest('.icon-button') && document.body.clientWidth <= 576) {
      wrapper.style.opacity = 0;
      fullscreenPlayer.classList.add('active');
   }
})
fullscreenPlayer.addEventListener('touchstart', (e) => {
   startY = e.touches[0].clientY;
   startX = e.touches[0].clientX;
   fingerMoved = false;
})
fullscreenPlayer.addEventListener('touchmove', (e) => {
   moveY = e.touches[0].clientY;
   moveX = e.touches[0].clientX;

   //? calc move angle
   moduleX = moveX - startX;
   moduleY = moveY - startY;
   let angle = moduleY === 0 ? 90 : Math.round(Math.atan(moduleX / moduleY) * 180 / Math.PI * 1000) / 1000


   //? Check if the finger is moving down
   if (moveY - startY > 75 && !e.target.closest('.fullscreen-player__playback__progressbar') && Math.abs(angle) < maxAngleToClose) {
      close = true;
   }
   fingerMoved = true;
})
fullscreenPlayer.addEventListener('touchend', (e) => {
   if (close) {
      fullscreenPlayer.classList.remove('active');
      wrapper.style.opacity = 1;
      close = false;
   }
})


//? set propertires to adapt page to a device's sizr that can't be set with CSS
function adaptPage() {
   if (document.body.clientWidth <= 576) {
      sliderPlayback.disabled = true;
   } else {
      sliderPlayback.disabled = false;
   }
   fullscrenPlayerWidth = document.querySelector('.fullscreen-player').clientWidth;
}
adaptPage();

window.addEventListener('resize', adaptPage);

function checkHover(attribute) {
   var element = document.querySelector(`${attribute}:hover`)
   if (element) return true
   else return false
}

function activateSongShelf() {
   if (document.getElementById(`song-shelf-${playSongs.currentSong.index}`)) {
      const currentSongShelf = document.getElementById(`song-shelf-${playSongs.currentSong.index}`),
         songShelfPlayIcon = currentSongShelf.querySelector('#play-icon'),
         songShelfPauseIcon = currentSongShelf.querySelector('#pause-icon'),
         songShelfPlayingIcon = currentSongShelf.querySelector('#playing-icon'),
         songIcon = songShelfPlayingIcon.parentNode,
         songIndex = currentSongShelf.querySelector('#index'),
         playedSongShelf = document.querySelector('.playing');

      if (playedSongShelf) deactivateSongShelf(playedSongShelf)
      currentSongShelf.classList.add('playing');


      songShelfPlayIcon.classList.add('hidden');
      if (!checkHover(`#song-shelf-${playSongs.currentSong.index}`)) {
         songShelfPauseIcon.classList.add('hidden');
         songShelfPlayingIcon.classList.remove('hidden');
      } else {
         songShelfPauseIcon.classList.remove('hidden');
         songShelfPlayingIcon.classList.add('hidden');
      }

      songIndex.classList.add('hidden');

      songShelfPauseIcon.classList.add('active-icon');
      songShelfPlayIcon.classList.remove('active-icon');

      songIcon.addEventListener('click', playPauseSongIcon);
   }
}

function playPauseSongIcon() {
   playPauseSong(false);
}

function deactivateSongShelf(songShelf) {
   const songShelfPlayIcon = songShelf.querySelector('#play-icon'),
      songShelfPauseIcon = songShelf.querySelector('#pause-icon'),
      songShelfPlayingIcon = songShelf.querySelector('#playing-icon'),
      songIcon = songShelfPlayingIcon.parentNode,
      songIndex = songShelf.querySelector('#index');

   songShelf.classList.remove('playing');

   songShelfPlayIcon.classList.add('hidden');
   songShelfPauseIcon.classList.add('hidden');
   songShelfPlayingIcon.classList.add('hidden');
   songIndex.classList.remove('hidden');

   songShelfPauseIcon.classList.remove('active-icon');
   songShelfPlayIcon.classList.add('active-icon');

   songIcon.removeEventListener('click', playPauseSongIcon);
}

var intervalPlaybackTime; //? for displaying current playback time
var isPlaying = false, started = false;

//? play video
document.onkeydown = keyShortcuts;

function keyShortcuts(e) {
   if (e.code == 'Space' && !e.repeat) {
      e.preventDefault();
      playPauseSong();
   }
   if (e.key == 'MediaTrackNext') {
      playNext();
   }
   if (e.key == 'MediaTrackPrevious') {
      toSongBeginning();
   }
}
playPause.addEventListener('click', playPauseSong);
playPause.addEventListener('touchend', playPauseSong);
fullscreenPlayerPlayPause.addEventListener('touchend', () => {
   if (!fingerMoved) playPauseSong();
});
function playPauseSong(isPlayerControl = true, changeOnlyIconsState = false) {
   if (isLoaded) {
      var playIcon = document.getElementById('play-controller'),
         pauseIcon = document.getElementById('pause-controller'),
         fullscreenPlayerpPlayIcon = document.getElementById('fullscreen-player-play-controller'),
         fullscreenPlayerpPauseIcon = document.getElementById('fullscreen-player-pause-controller');

      if (document.getElementById(`song-shelf-${playSongs.currentSong.index}`)) {
         var currentSongShelf = document.getElementById(`song-shelf-${playSongs.currentSong.index}`),
            songShelfPlayIcon = currentSongShelf.querySelector('#play-icon'),
            songShelfPauseIcon = currentSongShelf.querySelector('#pause-icon'),
            songShelfPlayingIcon = currentSongShelf.querySelector('#playing-icon'),
            index = currentSongShelf.querySelector('#index');
      }

      if (!isPlaying) {
         playIcon.classList.add('hidden');
         pauseIcon.classList.remove('hidden');
         fullscreenPlayerpPlayIcon.classList.add('hidden');
         fullscreenPlayerpPauseIcon.classList.remove('hidden');
         getCurrentPlaybackTime();

         if (currentSongShelf) {
            currentSongShelf.classList.remove('paused');
            index.classList.add('hidden');
            songShelfPlayingIcon.classList.remove('hidden');
            songShelfPlayIcon.classList.remove('active-icon');
            songShelfPauseIcon.classList.add('active-icon');
         }

         if (!isPlayerControl) {
            songShelfPauseIcon.classList.remove('hidden');
            songShelfPlayIcon.classList.add('hidden');
         }
         if (player) {
            if (player.getPlayerState() == 0) {
               toSongBeginning();
            }
            if (!changeOnlyIconsState) player.playVideo();
         }
         document.getElementsByTagName("title")[0].innerText = songItems[currentSongItem].title + ' • ' + songItems[currentSongItem].author;
         
      } else {
         playIcon.classList.remove('hidden');
         pauseIcon.classList.add('hidden');
         fullscreenPlayerpPlayIcon.classList.remove('hidden');
         fullscreenPlayerpPauseIcon.classList.add('hidden');

         if (currentSongShelf) {
            currentSongShelf.classList.add('paused');
            index.classList.remove('hidden');
            songShelfPlayingIcon.classList.add('hidden');
            songShelfPlayIcon.classList.add('active-icon');
            songShelfPauseIcon.classList.remove('active-icon');
         }
         if (!isPlayerControl) {
            songShelfPauseIcon.classList.add('hidden');
            songShelfPlayIcon.classList.remove('hidden');
         }
         if (player && !changeOnlyIconsState) {
            player.pauseVideo();
         }
         document.title = pageTitle;
      }
   }
}

//? set volume
sliderValume.addEventListener('input', setVolume);
function setVolume() {
   var volume = +sliderValume.value;
   playerSettings.volume = volume;
   sliderValume.value = volume;
   progress = (sliderValume.value / sliderValume.max) * 100;
   sliderValume.style.background = `linear-gradient(to right, var(--clr-progressbar-main-completed) ${progress}%, var(--clr-progressbar-main) ${progress}%)`;

   if (volume >= 50) {
      buttonValume.querySelector('.volume-loud').classList.remove('hidden')
      buttonValume.querySelector('.volume-silent').classList.add('hidden')
      buttonValume.querySelector('.volume-none').classList.add('hidden')
   } else if (volume > 0 && volume < 50) {
      buttonValume.querySelector('.volume-loud').classList.add('hidden')
      buttonValume.querySelector('.volume-silent').classList.remove('hidden')
      buttonValume.querySelector('.volume-none').classList.add('hidden')
   } else {
      buttonValume.querySelector('.volume-loud').classList.add('hidden')
      buttonValume.querySelector('.volume-silent').classList.add('hidden')
      buttonValume.querySelector('.volume-none').classList.remove('hidden')
   }
   if (player) player.setVolume(volume);
}

var volumeZero = false
buttonValume.addEventListener('click', () => {
   if (!volumeZero) {
      sliderValume.value = 0;
      tempSliderValue = 0;
      if (player) player.setVolume(0);
      buttonValume.querySelector('.volume-none').classList.remove('hidden')
      buttonValume.querySelector('.volume-loud').classList.add('hidden')
      buttonValume.querySelector('.volume-silent').classList.add('hidden')
      volumeZero = true;
   } else {
      tempSliderValue = playerSettings.volume;
      sliderValume.value = playerSettings.volume;

      if (playerSettings.volume >= 50) {
         buttonValume.querySelector('.volume-loud').classList.remove('hidden')
         buttonValume.querySelector('.volume-silent').classList.add('hidden')
         buttonValume.querySelector('.volume-none').classList.add('hidden')
         volumeZero = false;
      } else if (playerSettings.volume > 0 && playerSettings.volume < 50) {
         tempSliderValue = playerSettings.volume;
         sliderValume.value = playerSettings.volume;
         buttonValume.querySelector('.volume-loud').classList.add('hidden')
         buttonValume.querySelector('.volume-silent').classList.remove('hidden')
         buttonValume.querySelector('.volume-none').classList.add('hidden')
         volumeZero = false;
      }
      if (player) player.setVolume(playerSettings.volume);
   }
   progress = (tempSliderValue / sliderValume.max) * 100;
   sliderValume.style.background = `linear-gradient(to right, var(--clr-progressbar-main-completed) ${progress}%, var(--clr-progressbar-main) ${progress}%)`;
})

//? go to the beginning of the video
songBeginning.addEventListener('click', toSongBeginning);
songBeginning.addEventListener('touchend', toSongBeginning);
fullscreenPlayerSongBeginning.addEventListener('touchend', () => {
   if (!fingerMoved) toSongBeginning();
});
function toSongBeginning(toPrevSong = false, triggeredWithSlider = false) {
   if (player) {
      if ((Math.floor(player.getCurrentTime()) <= 3 && JSON.parse(localStorage.getItem('songItems')).length > 1) || toPrevSong) {
         loadSong(playSongs.prevSong.index);
         if (!triggeredWithSlider) swiper.slidePrev(300, false);
         setNewSong = true;
      } else if (Math.floor(player.getCurrentTime()) > 3) {
         player.seekTo(0, true);
         playbackPosition.textContent = fullscreenPlayerPlaybackPosition.textContent = '0:00'
         sliderPlayback.value = fullscreenPlayerSliderPlayback.value = 0;
         progress = (sliderPlayback.value / sliderValume.max) * 100;
         sliderPlayback.style.background = `linear-gradient(to right, var(--clr-progressbar-main-completed) ${progress}%, var(--clr-progressbar-main) ${progress}%)`;
         fullscreenPlayerSliderPlayback.style.background = `linear-gradient(to right,var(--clr-progressbar-fullscreenplayer-completed) ${progress}%, var(--clr-progressbar-fullscreenplayer) ${progress}%)`;
      }
   }
}

//? go to the end of the video
nextSong.addEventListener('click', playNext);
nextSong.addEventListener('touchend', playNext);
fullscreenPlayerNextSong.addEventListener('touchend', () => {
   if (!fingerMoved) playNext();
});
function playNext(triggeredWithSlider = false) {
   if (player && JSON.parse(localStorage.getItem('songItems')).length > 1) {
      loadSong(playSongs.nextSong.index);
      if (!triggeredWithSlider) swiper.slideNext(300, false);
      setNewSong = true;
   }
}

//? set playback time
sliderPlayback.addEventListener('input', setPlaybackTime);
fullscreenPlayerSliderPlayback.addEventListener('input', setPlaybackTime);
function setPlaybackTime(e) { //? time in sec
   if (!sliderPlayback.disabled) {
      time = Math.floor(sliderPlayback.value);
      hours = Math.floor(time / 60 / 60);
      minutes = hours !== 0 ? ("0" + String(Math.floor((time % 3600) / 60))).slice(-2) : Math.floor((time % 3600) / 60);
      seconds = ("0" + String(time - 60 * minutes)).slice(-2);
      hours = hours !== 0 ? hours + ':' : '';
      playbackPosition.textContent = fullscreenPlayerPlaybackPosition.textContent = hours + minutes + ":" + seconds;
   }
   if (e.target == fullscreenPlayerSliderPlayback) {

      time = Math.floor(fullscreenPlayerSliderPlayback.value);
      hours = Math.floor(time / 60 / 60);
      minutes = hours !== 0 ? ("0" + String(Math.floor((time % 3600) / 60))).slice(-2) : Math.floor((time % 3600) / 60);
      seconds = ("0" + String(time - 60 * minutes)).slice(-2);
      hours = hours !== 0 ? hours + ':' : '';
      playbackPosition.textContent = fullscreenPlayerPlaybackPosition.textContent = hours + minutes + ":" + seconds;
   }
}

//? mark that playback is being changed
sliderPlayback.addEventListener('mousedown', onStartSettingPlaybackTime);
sliderPlayback.addEventListener('touchstart', onStartSettingPlaybackTime);
sliderPlayback.addEventListener('touchstart', onStartSettingPlaybackTime);
fullscreenPlayerSliderPlayback.addEventListener('mousedown', onStartSettingPlaybackTime);
fullscreenPlayerSliderPlayback.addEventListener('touchstart', onStartSettingPlaybackTime);
function onStartSettingPlaybackTime(e) {
   if (!sliderPlayback.disable || e.target.closest() === 'fullscreenPlayer') {
      settingPlaybackTime = true;
   }
}

//? mark that playback is not being changed
sliderPlayback.addEventListener('mouseup', onStopSettingPlaybackTime);
sliderPlayback.addEventListener('touchend', onStopSettingPlaybackTime);
fullscreenPlayerSliderPlayback.addEventListener('touchend', onStopSettingPlaybackTime);
function onStopSettingPlaybackTime(e) {
   if (!sliderPlayback.disabled) {
      settingPlaybackTime = false;
      if (player) player.seekTo(time, true);
   }
   if (e.target == fullscreenPlayerSliderPlayback) {
      settingPlaybackTime = false;
      if (player) player.seekTo(time, true);
   }
}

//? get song's duration for setupping input rage max value and display the duration
function getDuration() {
   songDuration = Math.floor(player.getDuration());
   if (songDuration == 0) {
      playbackPosition.textContent = playbackDuration.textContent = fullscreenPlayerPlaybackPosition.textContent = fullscreenPlayerPlaybackDuration.textContent = '-:--';
      return
   } 
   hours = Math.floor(songDuration / 60 / 60);
   minutes = hours !== 0 ? ("0" + String(Math.floor((songDuration % 3600) / 60))).slice(-2) : Math.floor((songDuration % 3600) / 60);
   seconds = ("0" + String(songDuration - 60 * minutes)).slice(-2);
   hours = hours !== 0 ? hours + ':' : '';
   if (setNewSong) {
      playbackPosition.textContent = fullscreenPlayerPlaybackPosition.textContent = '0:00'
      setNewSong = false;
   }
   playbackDuration.textContent = fullscreenPlayerPlaybackDuration.textContent = hours + minutes + ":" + seconds;
   sliderPlayback.max = fullscreenPlayerSliderPlayback.max = songDuration;

}

//? display current playback time
function getCurrentPlaybackTime() {
   if (!settingPlaybackTime) {
      time = player.getCurrentTime();
      time = time ? Math.floor(time) : 0;
      hours = Math.floor(time / 60 / 60);
      minutes = hours !== 0 ? ("0" + String(Math.floor((time % 3600) / 60))).slice(-2) : Math.floor((time % 3600) / 60);
      seconds = ("0" + String(time - 60 * minutes)).slice(-2);
      hours = hours !== 0 ? hours + ':' : '';
      playbackPosition.textContent = fullscreenPlayerPlaybackPosition.textContent = hours + minutes + ":" + seconds;
      sliderPlayback.value = fullscreenPlayerSliderPlayback.value = time;
      progress = (sliderPlayback.value / sliderPlayback.max) * 100;
      sliderPlayback.style.background = `linear-gradient(to right, var(--clr-progressbar-main-completed) ${progress}%, var(--clr-progressbar-main) ${progress}%)`;
      fullscreenPlayerSliderPlayback.style.background = `linear-gradient(to right,var(--clr-progressbar-fullscreenplayer-completed) ${progress}%, var(--clr-progressbar-fullscreenplayer) ${progress}%)`;
   } else {
      clearInterval(intervalPlaybackTime);
   }
}

//? download song using YouTube MP3 API
songDownload.addEventListener('click', downloadSong);
songDownload.addEventListener('touchend', downloadSong);
songDownload.addEventListener('touchend', downloadSong);
fullscreenPlayerSongDownload.addEventListener('touchend', () => {
   if (!fingerMoved) downloadSong();
});
function downloadSong() {
   if (player) {
      var url = `https://youtube-mp36.p.rapidapi.com/dl?id=${playSongs.currentSong.id}`;
      var options = {
         method: 'GET',
         headers: {
            'X-RapidAPI-Key': '022457b63dmshc16978bb1b8a9e9p1f8f79jsn34c6ef30416c',
            'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
         }
      };
      fetchData(url, options)
         .then(response => {
            window.location.href = response.link;
         })
   }
}
async function fetchData(url, options) {
   try {
      var response = await fetch(url, options);
      var result = await response.text();
      return JSON.parse(result);
   } catch (error) {
      console.error(JSON.parse(error));
      return false;
   }
}

var repeatMode = playerSettings.repeatMode;
if (repeatMode == "one") {
   playbackMode.querySelector('.playback-once').classList.add('hidden');
   playbackMode.querySelector('.playback-repeat').classList.add('hidden');
   playbackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
} else if (repeatMode == "off") {
   playbackMode.querySelector('.playback-once').classList.remove('hidden');
   playbackMode.querySelector('.playback-repeat').classList.add('hidden');
   playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.remove('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
} else if (repeatMode == "on") {
   playbackMode.querySelector('.playback-once').classList.add('hidden');
   playbackMode.querySelector('.playback-repeat').classList.remove('hidden');
   playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.remove('hidden');
   fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
}
playbackMode.addEventListener('click', () => {
   setRepeatMode();
});
fullscreenPlayerPlaybackMode.addEventListener('touchend', () => {
   if (!fingerMoved) setRepeatMode();
});
function setRepeatMode(repeatModeRequested = null) {
   if (!repeatModeRequested) {
      if (repeatMode == "on") {
         repeatMode = "one";
         playbackMode.querySelector('.playback-once').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
      } else if (repeatMode == "one") {
         repeatMode = "off";
         playbackMode.querySelector('.playback-once').classList.remove('hidden');
         playbackMode.querySelector('.playback-repeat').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
      } else if (repeatMode == "off") {
         repeatMode = "on";
         playbackMode.querySelector('.playback-once').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat').classList.remove('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
      }
   } else {
      if (repeatModeRequested == "one") {
         repeatMode = "one";
         playbackMode.querySelector('.playback-once').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.remove('hidden');
      } else if (repeatModeRequested == "off") {
         repeatMode = "off";
         playbackMode.querySelector('.playback-once').classList.remove('hidden');
         playbackMode.querySelector('.playback-repeat').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
      } else if (repeatModeRequested == "on") {
         repeatMode = "on";
         playbackMode.querySelector('.playback-once').classList.add('hidden');
         playbackMode.querySelector('.playback-repeat').classList.remove('hidden');
         playbackMode.querySelector('.playback-repeat-one').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-once').classList.add('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat').classList.remove('hidden');
         fullscreenPlayerPlaybackMode.querySelector('.playback-repeat-one').classList.add('hidden');
      }
   }
   playerSettings.repeatMode = repeatMode;
}

var shuffle = playerSettings.shuffle;
if (shuffle == "off") {
   shuffleBtn.querySelector('.shuffle-on').classList.add('hidden');
   shuffleBtn.querySelector('.shuffle-off').classList.remove('hidden');
   fullscreenPlayerShuffleBtn.querySelector('.shuffle-on').classList.add('hidden');
   fullscreenPlayerShuffleBtn.querySelector('.shuffle-off').classList.remove('hidden');
} else if (shuffle == "on") {
   shuffleBtn.querySelector('.shuffle-on').classList.remove('hidden');
   shuffleBtn.querySelector('.shuffle-off').classList.add('hidden');
   fullscreenPlayerShuffleBtn.querySelector('.shuffle-on').classList.remove('hidden');
   fullscreenPlayerShuffleBtn.querySelector('.shuffle-off').classList.add('hidden');
}
shuffleBtn.addEventListener('click', setShuffle);
fullscreenPlayerShuffleBtn.addEventListener('touchend', () => {
   if (!fingerMoved) setShuffle();
});
function setShuffle() {
   if (songItems.length === 1) {
      return
   }
   if (shuffle == "on") {
      shuffle = "off";
      localStorage.removeItem('songsOrder');
      setPlaySongs(playSongs.currentSong.index - 1, songItems);
      shuffleBtn.querySelector('.shuffle-on').classList.add('hidden');
      shuffleBtn.querySelector('.shuffle-off').classList.remove('hidden');
      fullscreenPlayerShuffleBtn.querySelector('.shuffle-on').classList.add('hidden');
      fullscreenPlayerShuffleBtn.querySelector('.shuffle-off').classList.remove('hidden');
      renderSwiperWithNewData();
   } else if (shuffle == "off") {
      shuffle = "on";
      if (songLoaded && songItems.length > 1) {
         let songsOrder = shuffleSongsIndexes(songItems.length, playSongs.currentSong.index - 1);
         localStorage.setItem('songsOrder', JSON.stringify(songsOrder));
         setPlaySongs(playSongs.currentSong.index - 1, songItems, songsOrder);
         shuffleSlidesBasedOnOrder(songsOrder);

      }
      shuffleBtn.querySelector('.shuffle-on').classList.remove('hidden');
      shuffleBtn.querySelector('.shuffle-off').classList.add('hidden');
      fullscreenPlayerShuffleBtn.querySelector('.shuffle-on').classList.remove('hidden');
      fullscreenPlayerShuffleBtn.querySelector('.shuffle-off').classList.add('hidden');
   }
   playerSettings.shuffle = shuffle;
}

//? fill the object for prev and next song playing
function setPlaySongs(currentSongIndex, songItems, songsOrder = null) {

   if (songItems.length > 1) {
      let prevSongIndex, nextSongIndex;

      if (!songsOrder) {
         prevSongIndex = currentSongIndex - 1 < 0 ? songItems.length - 1 : currentSongIndex - 1;
         nextSongIndex = currentSongIndex + 1 > songItems.length - 1 ? 0 : currentSongIndex + 1;
      } else {
         let currentSongIndexShuffled = songsOrder.indexOf(currentSongIndex + 1);
         prevSongIndex = currentSongIndexShuffled - 1 < 0 ? songsOrder[songItems.length - 1] - 1 : songsOrder[currentSongIndexShuffled - 1] - 1;
         nextSongIndex = currentSongIndexShuffled + 1 > songItems.length - 1 ? songsOrder[0] - 1 : songsOrder[currentSongIndexShuffled + 1] - 1;
      }

      playSongs.prevSong.index = prevSongIndex + 1;
      playSongs.currentSong.index = currentSongIndex + 1;
      playSongs.nextSong.index = nextSongIndex + 1;


      playSongs.prevSong.id = songItems[prevSongIndex].id;
      playSongs.currentSong.id = songItems[currentSongIndex].id;
      playSongs.nextSong.id = songItems[nextSongIndex].id;
   } else {
      playSongs.prevSong.index = playSongs.currentSong.index = playSongs.nextSong.index = currentSongIndex;
      playSongs.prevSong.id = playSongs.currentSong.id = playSongs.nextSong.id = songItems[0].id;
   }

   localStorage.removeItem('playSongs');
   localStorage.setItem('playSongs', JSON.stringify(playSongs));
}


function shuffleSongsIndexes(amountOfSongs, currentSongIndex) {
   var array = [], m, t, i;
   //? create an array of song indexes
   for (let i = 1; i <= amountOfSongs; i++) {
      array.push(i);
   }

   //? swap the current song index with the first one
   t = array[currentSongIndex];
   array[currentSongIndex] = array[0];
   array[0] = t;

   //? shuffle the array exept the first element (current song)
   m = array.length;
   while (m) {
      i = Math.floor(Math.random() * m--);

      //? swap current el with last remaining, not touching current song
      if (i != 0) {
         t = array[i];
         array[i] = array[m];
         array[m] = t;
      }
   }
   return array;
}

function textScrollAnimation(element) { //! element must contain <p></p>
   const position = 'right',
      textElement = element.querySelector('p'),
      elementWidth = element.offsetWidth,
      textElementWidth = textElement.offsetWidth;
   if (textElementWidth <= elementWidth) {
      return;
   }
   const style = document.createElement('style') || document.querySelector('style'),
      animationDuration = textElementWidth / 30 + 2,
      animationIterationDelayPercent = Math.round(2 / animationDuration * 100 * 1000) / 1000,
      animationMovementDuration = animationDuration - 2,
      animationFromCenterToLeftDuration = animationIterationDelayPercent + Math.round(Math.round(textElementWidth / (textElementWidth + elementWidth) * animationMovementDuration * 1000) / 1000 / animationDuration * 100 * 1000) / 1000 ;
   textElement.style.animation = `scrolling-text-${element.classList[0]} ${animationDuration}s normal linear infinite`;
   style.innerHTML += `
      @keyframes scrolling-text-${element.className} {
         0%, 100% {
            ${position}: ${elementWidth - textElementWidth}px;
         }
         ${animationIterationDelayPercent}% {
            ${position}: ${elementWidth - textElementWidth}px;
         }
         ${animationFromCenterToLeftDuration}% {
            ${position}: 100%;
            opacity: 1;
         }
         ${animationFromCenterToLeftDuration + 0.001}% {
            opacity: 0;
            ${position}: -${textElementWidth + 10}px;
         }
         ${animationFromCenterToLeftDuration + 0.0011}% {
            opacity: 1;
         }
      }
   `;
   document.head.append(style);
}