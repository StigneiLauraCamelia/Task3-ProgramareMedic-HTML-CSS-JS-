let DB;

let form = document.querySelector('form');
let nume = document.querySelector('#nume');
let prenume = document.querySelector('#prenume');
var emailError = document.getElementById('email-error');
let specialitate = document.querySelector('#specialitate');
let doctor = document.querySelector('#doctor');
//let telefon = document.querySelector('#telefon');
var telefonError = document.getElementById('telefon-error');
let date = document.querySelector('#data');
let time = document.querySelector('#ora');
let symptoms = document.querySelector('#simptome');
let consultations = document.querySelector('#consultations');
let services = document.querySelector('#services');



function validateEmail(){
  var email = document.getElementById('email').value ;
  if(email.lenght == 0){
    emailError.innerHTML = 'Va rugam adaugati email-ul';
    return false;
  }
  if(!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
    emailError.innerHTML = 'Email scris gresit';
    return false;
  }

  emailError.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
  return true;
}


function validateTelefon(){
     var telefon = document.getElementById('telefon').value ;
   
     if(telefon.match(/^[a-zA-Z]+$/)){
       telefonError.innerHTML = 'Teleful nu poate sa fie format din litere';
       return false;
     }
     telefonError.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
     return true;
   }
   

function validateForm(){
  if(!validateEmail() || !validateTelefon()){
    submitError.style.display = 'block';
    submitError.innerHTML = 'Please fix error to submit';
    setTimeout(function(){submitError.style.display = 'none';}, 3000);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
   
     let ScheduleDB = window.indexedDB.open('consultations', 1);

    
     ScheduleDB.onerror = function() {
          console.log('error');
     }
  
     ScheduleDB.onsuccess = function() {
        
          DB = ScheduleDB.result;

          showConsultations();
     }

   
     ScheduleDB.onupgradeneeded = function(e) {
          
          let db = e.target.result;
          
          let objectStore = db.createObjectStore('consultations', { keyPath: 'key', autoIncrement: true } );
        
          objectStore.createIndex('nume', 'nume', { unique: false } );
          objectStore.createIndex('prenume', 'prenume', { unique: false } );
          objectStore.createIndex('email', 'email', { unique: false } );
          objectStore.createIndex('specialitate', 'specialitate', { unique: false } );
          objectStore.createIndex('doctor', 'doctor', { unique: false } );
          objectStore.createIndex('telefon', 'telefon', { unique: false } );
          objectStore.createIndex('data', 'data', { unique: false } );
          objectStore.createIndex('ora', 'ora', { unique: false } );
          objectStore.createIndex('simptome', 'simptome', { unique: false } );

      
     }

     form.addEventListener('submit', addConsultations);

     function addConsultations(e) {
          e.preventDefault();
          let newConsultation = {
            email : email.value,
            nume : nume.value,
            prenume : prenume.value,
            specialitate : specialitate.value,
            doctor : doctor.value,
            telefon : telefon.value,
            data : data.value,
            ora : ora.value,
            simptome : simptome.value
          }
          
          let transaction = DB.transaction(['consultations'], 'readwrite');
          let objectStore = transaction.objectStore('consultations');

          let request = objectStore.add(newConsultation);
                    request.onsuccess = () => {
               form.reset();
          }
          transaction.oncomplete = () => {
              

               showConsultations();
          }
          transaction.onerror = () => {
            
          }

     }
     function showConsultations() {
       
          while(consultations.firstChild) {
            consultations.removeChild(consultations.firstChild);
          }
         
          let objectStore = DB.transaction('consultations').objectStore('consultations');

          objectStore.openCursor().onsuccess = function(e) {
               
               let cursor = e.target.result;
               if(cursor) {
                    let ConsultationHTML = document.createElement('li');
                    ConsultationHTML.setAttribute('data-consultation-id', cursor.value.key);
                    ConsultationHTML.classList.add('list-group-item');
                    
                 
                    ConsultationHTML.innerHTML = ` 
                       
                        <p class="font-weight-bold">Nume pacient:  <span class="font-weight-normal">${cursor.value.nume}<span></p>
                        <p class="font-weight-bold">Prenume pacient:  <span class="font-weight-normal">${cursor.value.prenume}<span></p>
                        <p class="font-weight-bold">Email:  <span class="font-weight-normal">${cursor.value.email}<span></p>
                        <p class="font-weight-bold">Specialitate:  <span class="font-weight-normal">${cursor.value.specialitate}<span></p>
                        <p class="font-weight-bold">Doctor:  <span class="font-weight-normal">${cursor.value.doctor}<span></p>
                        <p class="font-weight-bold">NumarTelefon:  <span class="font-weight-normal">${cursor.value.telefon}<span></p>
                        <p class="font-weight-bold">Data:  <span class="font-weight-normal">${cursor.value.data}<span></p>
                        <p class="font-weight-bold">Ora:  <span class="font-weight-normal">${cursor.value.ora}<span></p>
                        <p class="font-weight-bold">Simptome:  <span class="font-weight-normal">${cursor.value.simptome}<span></p>
                    `;

                    
                    const cancelBtn = document.createElement('button');
                    cancelBtn.classList.add('btn', 'btn-danger');
                    cancelBtn.innerHTML = 'Stergeti';
                    cancelBtn.onclick = removeConsultation;
               
                 
                    ConsultationHTML.appendChild(cancelBtn);
                 consultations.appendChild(ConsultationHTML);

                    cursor.continue();
               } else {
                    if(!consultations.firstChild) {
                        services.textContent = 'Schimbati ora consultatiei';
                         let noSchedule = document.createElement('p');
                         noSchedule.classList.add('text-center');
                         noSchedule.textContent = 'No results Found';
                      consultations.appendChild(noSchedule);
                    } else {
                        services.textContent = 'Anulati programarea la consultatie'
                    }
               }
          }
     }

          function removeConsultation(e) {
       
          let scheduleID = Number( e.target.parentElement.getAttribute('data-consultation-id') );
         
          let transaction = DB.transaction(['consultations'], 'readwrite');
          let objectStore = transaction.objectStore('consultations');
         
          objectStore.delete(scheduleID);

          transaction.oncomplete = () => {
             
               e.target.parentElement.parentElement.removeChild( e.target.parentElement );

               if(!consultations.firstChild) {
                   
                    services.textContent = 'Schimbati ora consultatiei';
                   
                   let noSchedule = document.createElement('p');
                  
                   noSchedule.classList.add('text-center');
                   
                   noSchedule.textContent = 'No results Found';
                
                    consultations.appendChild(noSchedule);
               } else {
                   services.textContent = 'ANULATI PROGRAMAREA LA CONSULATIE'
               }
          }
     }

});


