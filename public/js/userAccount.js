(function () {
   'use strict';
   const form = document.querySelector('.changepw');

   //return if no forms to validate / or move <script> tags to relevent files
   if (!form) return;

   form.addEventListener('submit', function (e) {
      e.stopPropagation();
      e.preventDefault();

      /**
       * return if validation fails - add proper form validation for password strength + feedback
       * - make all form related code one file
       */
      if (!form.checkValidity()) return;

      /**
       * To send form data in a fetch request the formData must be sent in a URLSearchParams
       * object. 
       * 
       * The key:values of this can be set by looping through the entries of a FormData object.
       *  - 'Content-Type': 'application/x-www-form-urlencoded'
       *  - FormData() can be passed a form from which key:values can be assigned from the inputs.
       */
      let formData = new URLSearchParams();
      for (const pair of new FormData(form)) {
         formData.append(pair[0], pair[1]);
      }

      /** To send data via JSON the body must be a stringified object 
       *  - it is not possible to send files this way?
      */
      formData = JSON.stringify({
         user: {
            oldPassword: form.elements.oldPassword.value,
            newPassword: form.elements.newPassword.value,
         }
      });

      const userId = window.location.pathname.substring(6, 31);
      fetch('/user/password/' + userId, {
         method: 'POST',
         body: formData,
         headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
         },
      })
         /**
          * Can be used to get a server rendered html markup
          * checks if response is JSON or HTML
          */
         .then(body => body.headers.get('content-type').includes('text/html') ? body.text() : body.json())
         .then(res => {
            const pwUpdate = document.querySelector('.pw-update-text');
            pwUpdate.classList.add('success');
            form.classList.remove('was-validated');
            for (const element of form.elements) {
               element.value = null;
            }
         });
   });
}());