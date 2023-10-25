(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const burgerNav = document.querySelector('.burger-nav');
    const burgerButton = document.querySelector('.burger');
    burgerButton.addEventListener('click', () => {
      for (let i = 0; i < burgerButton.children.length; i++) {
        burgerButton.children[i].classList.toggle('open');
      }
      burgerNav.classList.toggle('open');
    });

    const modalSignIn = document.querySelector('.modal-sign-in');
    const signInButton = document.querySelector('.sign-in');
    signInButton.addEventListener('click', () => {
      modalSignIn.classList.add('open');
    });

    const overlay = document.querySelector('.overlay');
    overlay.addEventListener('click', () => {
      const modalOpen = document.querySelector('.modal.open');
      modalOpen.classList.remove('open');
    });

    const closeButtonModal = document.querySelector('.modal__close-btn');
    closeButtonModal.addEventListener('click', () => {
      const modalOpen = document.querySelector('.modal.open');
      modalOpen.classList.remove('open');
    });

    const tooltipHelp = document.querySelector('.tooltip-help');
    const helpButton = document.querySelector('.help-btn');
    helpButton.addEventListener('click', () => {
      tooltipHelp.classList.toggle('open');
    });

    const payList = document.querySelector('.pay-nav__list');
    for (let i = 0; i < payList.children.length - 1; i++) {
      const link = payList.children[i].querySelector('.pay-nav__link');
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        const id = link.getAttribute('href');
        const target = document.querySelector(id);
        const offsetTop = target.getBoundingClientRect().top - 69;

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
      })
    };

    const accordion = document.querySelector('.payment-services');
    for (let i = 0; i < accordion.children.length; i++) {
      const title = accordion.children[i].querySelector('.payment-services__title');
      title.addEventListener("click", () => {
        const wrapper = accordion.children[i].querySelector('.payment-services__content-wrapper');
        const content = wrapper.querySelector('.payment-services__content');
        const arrow = title.querySelector('.payment-services__arrow');
        if (wrapper.style.height) {
          wrapper.style.height = null;
          arrow.classList.remove('rotate180');
        } else {
          wrapper.style.height = content.scrollHeight + "px";
          arrow.classList.add('rotate180');
        }
      });
    };
  });
})();
