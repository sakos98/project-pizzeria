import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    
    
    let pageMatchingHash = thisApp.pages[2].id;
    
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
        
      }
    }
    thisApp.activatePage(pageMatchingHash);
    
    for(let link of thisApp.navLinks){
      link.addEventListener('click', (event)=>{

        const clickedElement = event.currentTarget;
        event.preventDefault();
       

        // get page ID from href attr.
        const id = clickedElement.getAttribute('href').replace('#', '');
        // run thisApp.activatePage() with ID
        thisApp.activatePage(id);
        
        // change URL hash, add / to prevent scrolling to #

        window.location.hash = '#/' + id;

      });
    }

  },

  activatePage: function(pageId){
    const thisApp = this;
    
    /* add class 'active' to matching PAGES, remove from non-matching */
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class 'active' to matching LINKS, remove from non-matching */
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initBooking: function(){
    const thisApp = this;
    thisApp.bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookingContainer);

  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parseResponse) {

        /* save parseResponse as thisApp.data.products */
        thisApp.data.products = parseResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
  },
};

app.init();
