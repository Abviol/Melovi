const sliderEls = document.querySelectorAll(".progressbar")

sliderEls.forEach(sliderEl => {
   sliderEl.addEventListener("input", (event) => {
      const tempSliderValue = event.target.value;
      const progress = (tempSliderValue / sliderEl.max) * 100;
      if (!event.target.closest('.fullscreen-player')) {
         console.log('not fullscreen playe')
         sliderEl.style.background = `linear-gradient(to right, var(--clr-progressbar-main-completed) ${progress}%, var(--clr-progressbar-main) ${progress}%)`;
      } else {
         sliderEl.style.background = `linear-gradient(to right,var(--clr-progressbar-fullscreenplayer-completed) ${progress}%, var(--clr-progressbar-fullscreenplayer) ${progress}%)`;
      }
      
   })
})