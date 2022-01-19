(function () {
   'use strict';
   const forms = document.querySelectorAll('.needs-validation');

   //return if no forms to validate / or move <script> tags to relevent files
   if (!forms.length) return;

   Array.from(forms)
      .forEach(function (form) {
         form.addEventListener('submit', function (e) {
            if (!form.checkValidity()) {
               e.preventDefault();
               e.stopPropagation();
            }
            // this is added as soon as form submits
            form.classList.add('was-validated');
         });
      });
}());
            //move this to somewhere else
/**
 * MOVE THIS SOMEWHERE ELSE
 * use a class for css
 * do not show if no images selected
 * or maybe show with as a transition to the next page if updates need to happen?
 */
            //    let div = document.createElement('div');
            //    div.style.position = 'absolute';
            //    div.style.backgroundColor = '#ffffffdd';
            //    div.style.width = '100%';
            //    div.style.height = '100%';
            //    div.innerHTML = '<h3>Your Images Are Uploading!</h3><p>remember to move this code and completely change it!!</p>';
            //    div.style.zIndex = '1000';
            //    div.style.display = 'flex';
            //    div.style.flexDirection = 'column';
            //    div.style.alignItems = 'center';
            //    div.style.justifyContent = 'center';
            //    div.style.fontSize = '2em';
            //    div.children[0].style.fontSize = '1.5em';

            //    let body = document.querySelector('body');
            //    body.append(div);
            // }, false);

