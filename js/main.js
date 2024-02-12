//? const elements
const body = document.getElementsByTagName('body')[0];
const switchThemeButton = document.querySelector('#switch-theme'); //! replace theme-mode with switch-theme
const eyeButtons = document.querySelectorAll('[name="eye"]'); 
const icons = document.querySelectorAll('[type="icon"]');

//? aside bar elements
const toHome = document.getElementById('to-home')
const openSearch = document.getElementById('open-search')
const toPlaylists = document.getElementById('to-playlists')
const toProfile = document.getElementById('to-profile')


//? toggle password visibility
eyeButtons.forEach(eyeButton => {
   eyeButton.addEventListener('click', (e) => {
      let passwordInput = eyeButton.parentElement.parentElement.querySelector('input#password');
      const currentSrc = eyeButton.getAttribute('src');
      let newSrc;
      if (currentSrc.includes('opened')) {
         newSrc = currentSrc.replace('opened', 'closed');
         passwordInput.type = 'password';
      } else {
         newSrc = currentSrc.replace('closed', 'opened');
         passwordInput.type = 'text';
      }
      eyeButton.setAttribute('src', newSrc + `?v${Date.now()}`);
   });
})

//? enable/disable dark mode
if (!localStorage.getItem('themeMode')) localStorage.setItem('themeMode', 'light')
else if (localStorage.getItem('themeMode') === 'dark') {
   body.classList.add('dark');
   switchThemeButton.querySelector('.to-light-theme').classList.remove('hidden');
   switchThemeButton.querySelector('.to-dark-theme').classList.add('hidden');

} else {
   body.classList.remove('dark');
   switchThemeButton.querySelector('.to-light-theme').classList.add('hidden');
   switchThemeButton.querySelector('.to-dark-theme').classList.remove('hidden');
}

switchThemeButton.addEventListener('click', (e) => {
   body.classList.toggle('dark');
   if (localStorage.getItem('themeMode') === 'light') {
      localStorage.setItem('themeMode', 'dark')
      switchThemeButton.querySelector('.to-light-theme').classList.remove('hidden');
      switchThemeButton.querySelector('.to-dark-theme').classList.add('hidden');
   } else {
      localStorage.setItem('themeMode', 'light')
      switchThemeButton.querySelector('.to-light-theme').classList.add('hidden');
      switchThemeButton.querySelector('.to-dark-theme').classList.remove('hidden');
   }
   icons.forEach(icon => {
      const currentSrc = icon.getAttribute('src');
      let newSrc;
      if (currentSrc.includes('sun') || currentSrc.includes('moon')) {
         newSrc = currentSrc.includes('moon') ? currentSrc.replace('moon', 'sun') : currentSrc.replace('sun', 'moon');
      } else {
         newSrc = currentSrc.includes('light') ? currentSrc.replace('light', 'dark') : currentSrc.replace('dark', 'light');
      }
      icon.setAttribute('src', newSrc + `?v=${Date.now()}`);
   });
});

//? disable aside bar buttons that redirect a user to a unrealised page/feature
const asideBarButtons = [
   toHome, 
   openSearch, 
   toPlaylists, 
   toProfile
]
var prevAlertType = '';
const closeAlert = document.querySelector('.close_btn');
asideBarButtons.forEach(button => {
   button.addEventListener('click', (event) => {
      // event.preventDefault();
      showMessage('Coming soon!');
   })
})
function showMessage(message, type = 'info') {
   //todo type: 'success', 'warning', 'error', 'info'
   //? default is error
   let alert = document.querySelector('.alert');
   let alertText = alert.querySelector('#alertText');
   alertText.textContent = message;
   if (prevAlertType !== '') {
      alert.classList.remove(`alert-${prevAlertType}`);
   }
   alert.classList.add(`alert-${type}`);
   alert.classList.add('show-alert');
   prevAlertType = type;
}
//? hide error message
closeAlert.addEventListener('click', (e) => {
   let alert = document.querySelector('.alert');
   alert.classList.replace('show-alert', 'hide-alert');
   setTimeout(() => {
      alert.classList.remove('hide-alert');
   },
      800)
});
