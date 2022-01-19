(function () {
   'use strict';
   const campAlert = document.querySelector('.alert.fade');
   campAlert.style.position = 'absolute';
   campAlert.style.width = '100%';


   function fadeout() {
      campAlert.style.transition = 'opacity 1s ease-in-out';
      campAlert.style.opacity = '0';
   }

   function slideout() {
      campAlert.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
      campAlert.style.opacity = '0';
      campAlert.style.transform = `translateY(${-campAlert.clientHeight}px)`;
   }
   if (campAlert) {
      //if there is an alert add listener -  BOOTSTRAP ALREADY ADDED A LISTENER... I cant find it anymore!!
      // if bootstrap removed oven listener required
      campAlert.addEventListener('transitionend', function (e) {
         this.remove();
      }, { once: true });

      //set a timeout to fade alert
      setTimeout(slideout, 2000);
   }
}());