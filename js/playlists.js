const importPlaylistButton = document.querySelector('#import-playlist');
console.log(importPlaylistButton);

importPlaylistButton.addEventListener('click', () => {
   window.location.href = 'import.html'
})