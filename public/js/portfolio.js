// SKILLS
const skillsContent = document.getElementsByClassName('skills__content'),
      skillsHeader = document.querySelectorAll('.skills__header')

function toggleSkills() {
  let itemClass = this.parentNode.className

  for(i = 0; i < skillsContent.length; i++) {
    skillsContent[i].className = 'skills__content skills__close'
  }
  if(itemClass === 'skills__content skills__close') {
    this.parentNode.className = 'skills__content skills__open'
  }
}

skillsHeader.forEach((header) => {
  header.addEventListener('click', toggleSkills)
})

// SERVICES MODAL
const modalViews = document.querySelectorAll('.services__modal'),
      modalBtns = document.querySelectorAll('.services__button'),
      modalCloses = document.querySelectorAll('.services__modal-close')

let modal = function(modalClick) {
  modalViews[modalClick].classList.add('active-modal')
}

modalBtns.forEach((modalBtn, i) => {
  modalBtn.addEventListener('click', () => {
    modal(i)
  })
})

modalCloses.forEach((modalClose) => {
  modalClose.addEventListener('click', () => {
    modalViews.forEach((modalView) => {
      modalView.classList.remove('active-modal')
    })
  })
})



// modalShopCloses.addEventListener('click', () => {
//   modalShop.classList.remove('active-modal');
// })
      

// PORTFOLIO SWIPER JS
const swiper = new Swiper('.portfolio__container', {
  cssMode: true,
  loop: true,

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  keyboard: true,
});

// Contact me 

const sendMessage = document.querySelector('.send__message');
let name =document.getElementById('name');
let email = document.getElementById('email');
let subject = document.getElementById('subject');
let message = document.getElementById('message');


sendMessage.addEventListener('click', (e) => {
  e.preventDefault();

  let formData = {
    name: name.value,
    email: email.value,
    subject: subject.value,
    message: message.value
  }

  let xhr = new XMLHttpRequest();
  xhr.open('POST', '/send-message');
  xhr.setRequestHeader('content-type', 'application/json');
  xhr.onload = function() {
    if(xhr.readyState === xhr.DONE) {
      if(xhr.status === 200) {
        alert('Email sent');
        name.value = '';
        email.value = '';
        subject.value = '';
        message.value = '';
      }
    } else {
      alert('Something went wrong');
    }
  }

  xhr.send(JSON.stringify(formData));
});