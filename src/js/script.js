/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: '.cart__total-number',
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
  db: {
    url: 'http://localhost:3131',
    products: 'products',
    orders: 'orders',
  },
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML)
};

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
  }

  renderInMenu() {
    const thisProduct = this;
    /* geneate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuCointainer = document.querySelector(select.containerOf.menu);
    /* add elemnt to menu */
    menuCointainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element remove class active from it */
      if (activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toogle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      
      thisProduct.processOrder();
      thisProduct.addToCard();
    });
  }

  processOrder() {
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // set price to default price
    let price = thisProduct.data.price;
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
          if (!option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default) {
            // reduce price variable
            price -= option.price;
          }
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        if (optionImage) {
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price;
    /* multiply price by amont */
    //price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML

  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('update', function () { thisProduct.processOrder(); });
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = parseInt(thisProduct.amountWidget.value);
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;
  }

  addToCard() {
    const thisProduct = this;


    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {}
      };

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}


class amountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);

    /* TODO: Add validation */
    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      if (newValue >= settings.amountWidget.defaultMin) {
        if (newValue <= settings.amountWidget.defaultMax) {
          thisWidget.value = newValue;
        }
      }
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.input.value);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.input.value);
    });
  }
}

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.address = document.querySelector(select.cart.address);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;

    for (let singleProduct of thisCart.products){
      thisCart.totalNumber += singleProduct.amount;
      thisCart.subtotalPrice += singleProduct.price;
    }

    if(thisCart.totalNumber == 0){
      thisCart.deliveryFee = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    for (let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
  }
  remove(object){
    const thisCart = this;

    const removeProductHTML = object.dom.wrapper;
    removeProductHTML.remove();

    const indexOfRemovedObject = thisCart.products.indexOf(object);
    thisCart.products.splice(indexOfRemovedObject, 1);
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
  

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAction();
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      }
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initAction() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData(){
    const thisCartProduct = this;

    const productCartSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };

    return (productCartSummary);
  }
}


const app = {
  initMenu: function () {
    const thisApp = this;


    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
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
    thisApp.initCart();
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
};

app.init();
