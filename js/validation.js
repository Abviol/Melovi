//? const elements
const authForm = document.forms.auth;
const inputEmail = authForm.querySelector('.email');
const inputPassword = authForm.querySelector('.password');
const inputPasswordConfirm = authForm.querySelector('.password-confirm');
const closeAlert = document.querySelector('.close_btn');
console.log(inputPasswordConfirm);

//? changing alert method to 'show specified alert message'
window.alert = (message) => {
   let alert = document.querySelector('.alert');
   let alertText = alert.querySelector('#alertText');
   alertText.textContent = message;
   alert.classList.add('show-alert');
}

//? validate form inputs before sending it for handling
authForm.addEventListener('submit', (e) => {
   let email = inputEmail.value;
   if (!isEmailValid(email)) {
      console.log(email);
      alert("Недійсна пошта");
      e.preventDefault();
   }
});
authForm.addEventListener('submit', (e) => {
   let password = inputPassword.value;
   if (!isPasswordValid(password)) {
      console.log(password);
      alert("Пароль має містити щонайменше 8 символів");
      e.preventDefault();
   }
});
authForm.addEventListener('submit', (e) => {
   let password = inputPassword.value;
   let passwordConfirm = inputPasswordConfirm.value;
   if (!isPasswordSame(password, passwordConfirm)) {
      alert("Паролі не збігаються");
      e.preventDefault();
   }
});

//? validate email
function isEmailValid(email) {
   let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailPattern.test(email);
}
//? validate password
function isPasswordValid(password) {
   console.log(String(password).length);
   if (String(password).length < 8) {
      console.log("23f3f24f");
      return false;
   } else return true;
}
//? check if password and passwornConfirm are the same
function isPasswordSame(password, passwordConfirm) {
   if (password != passwordConfirm) {
      console.log("faile");
      return false;
   } else return true;
}

//? hide error message
closeAlert.addEventListener('click', (e) => {
   let alert = document.querySelector('.alert');
   alert.classList.replace('show-alert', 'hide');
   setTimeout(() => {
      alert.classList.remove('hide');
   },
      800)
});