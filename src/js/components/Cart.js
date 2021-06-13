import { select, classNames, templates, settings } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
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
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.adress = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();

      thisCart.sendOrder();
      thisCart.emptyCart();
      thisCart.update();
    });
  }
  add(menuProduct){
    const thisCart = this,
      generatedHTML = templates.cartProduct(menuProduct),
      generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update(menuProduct);
  }
  update(){
    const thisCart = this;

    thisCart.totalPrice = 0;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subTotalPrice += product.price;
    }
    if(thisCart.totalNumber != 0){
      thisCart.totalPrice = thisCart.subTotalPrice + thisCart.deliveryFee;
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    } else {
      thisCart.deliveryFee = 0;
    }
      
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    [].forEach.call(thisCart.dom.totalPrice, function(totalWrapper) {
      totalWrapper.innerHTML = '';
      totalWrapper.innerHTML = thisCart.totalPrice;
    });
  }
  remove(product){
    const thisCart = this,
      productIndex = thisCart.products.indexOf(product);

    product.dom.wrapper.innerHTML = '';
    thisCart.products.splice(productIndex, 1);
    thisCart.update();
  }
  emptyCart(){
    const thisCart = this;

    thisCart.products.splice(0, thisCart.products.length);
    thisCart.dom.productList.innerHTML = '';
  }
  sendOrder(){
    const thisCart = this,
      url = settings.db.url + '/' + settings.db.orders,
      payload = {
        address: thisCart.dom.adress.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subTotalPrice,
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
    
    fetch(url, options);
  }
}

export default Cart;