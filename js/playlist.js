const main = document.querySelector('#main')
const playAllBtns = document.querySelectorAll('#play-all')
const playlistHeaderScroll = document.querySelector('#playlist-header-scroll')
const headerImport = document.querySelector('#header-import')
const headerImportRight = document.querySelector('#header-import-right')
const headerImportLeft = document.querySelector('#header-import-left')
const playlistHeader = document.querySelector('#playlist-header')

playAllBtns.forEach(playAllBtn => {
   playAllBtn.addEventListener('click', (e) => {
      console.log('play all')
      isLastImported = true;
      songItemsInLocalStorage = localStorage.getItem('songItems');
      if (JSON.stringify(songItemsInLocalStorage) != songItems) {
         songItemsToUpload = songItems;
         localStorage.removeItem('songItems');
         localStorage.setItem('songItems', JSON.stringify(songItemsToUpload));
      }
      loadSong(1, 'out of order');
      setRepeatMode('off');
   })
})

main.addEventListener('scroll', (event) => {
   if (main.scrollTop > 25) {
      headerImport.classList.add('scrolled')
      
   } else {
      headerImport.classList.remove('scrolled')
   }
   if (main.scrollTop >= playlistHeader.offsetHeight + playlistHeader.offsetTop - 50) {
      playlistHeaderScroll.classList.add('show')
      // playlistHeaderScroll.classList.remove('hide')
      headerImportRight.classList.add('hide')
      headerImportLeft.classList.add('hide')
      
   } else {
      playlistHeaderScroll.classList.remove('show')
      // playlistHeaderScroll.classList.add('hide')::
      headerImportRight.classList.remove('hide')
      headerImportLeft.classList.remove('hide')
   }
})