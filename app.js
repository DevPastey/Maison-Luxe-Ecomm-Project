const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

const increaseAmount = document.querySelector('.up');
const decreaseAmount = document.querySelector('.down');  
//const bannerBtn = document.querySelector('.banner-btn');

//cart
let cart = [];
//buttons
let buttonsDOM = [];


//getting the products
class Products {
  async getProducts () {
    try {
      let res = await fetch('products.json');
      let data = await res.json();

      let products = data.items;
      products = products.map(item =>{
        const {title,price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, id, image};
      });
  
      return products;
      


    } catch (error) {
      console.log(error)
    }
  }
};

//display products
class UI {
  displayProducts(productList) {
    let result = '';
    productList.forEach(product => {
      result += `
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="product" class="product-img">
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to cart
          </button>
        </div>

        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>

      </article>
      `
    });
    productsDOM.innerHTML = result;
  }
  getBagButton() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    //console.log(buttons);
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

        button.addEventListener('click', (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;



          //get product from products
          let cartItem = {...Storage.getProducts(id), amount: 1};
          
          //add product to cart
          cart = [...cart, cartItem];

          //console.log(cart)
          
          Storage.saveCart(cart);
          //set cart values
          this.setCartValues(cart);
          //display cart item
          this.addCartItem(cartItem);
          
          //clear the cart
          //this.clearCart();

          //show and hide the cart
          //this.toggleCart()
        });
      
        
    });
  }

  /*resetBagBtn() {
    buttonsDOM.forEach(button => {
      button.innerText = "Add to bag";
      button.disabled = false;
    });
  }*/
  
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    console.log(cartTotal, cartItems);
     
    
  };

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <figure>
        <img src=${item.image} alt="product">
      </figure>
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>Remove</span>
      </div>

      <div>
        <i class="fas fa-chevron-up up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down down" data-id=${item.id}></i>

      </div>
    `;
    
    cartContent.appendChild(div);
    //console.log(cartContent)
  }
  

  setupAPP() {
    cart = Storage.getCart();

    this.setCartValues(cart);
    this.populateCart(cart);


    this.hideCart();
    
    this.checkCart();
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));

  }

  hideCart() {
    closeCartBtn.addEventListener('click', () => {
      cartOverlay.classList.remove('transparentBcg');
      cartDOM.classList.remove('showCart');
    })
  }

  

 checkCart() {
   cartBtn.addEventListener('click', () => {
     cartDOM.classList.add('showCart');
     cartOverlay.classList.add('transparentBcg');
     //console.log(cartDOM.classList);
   })
 }

 cartLogic() {
   clearCartBtn.addEventListener('click', () => {
    this.clearCart();
    
    //cart functionality

    
   })
  }
  clearCart() {
    
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => { this.removeItem(id) });
      while (cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
        //let index = cart.indexOf(cartItem);
      }
      this.hideCart();
      //cart.splice(index, 1);
  
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to bag`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }


  updateAmount(id) {
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {

        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        


        this.removeItem(id);
        console.log(cart)
      }

      else if (event.target.classList.contains('up')) {
        
        let increaseAmount = event.target;
        let id = increaseAmount.dataset.id;
        let tempItem = cart.find(item => item.id===id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        increaseAmount.nextElementSibling.innerText = tempItem.amount;

      }

      else if (event.target.classList.contains('down')) {
        let decreaseAmount = event.target;
        let id =decreaseAmount.dataset.id;
        console.log(decreaseAmount.previousElementSibling)
        let tempItem = cart.find(item => item.id===id);
        tempItem.amount = tempItem.amount - 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        decreaseAmount.previousElementSibling.innerText = tempItem.amount;

        if (tempItem.amount === 0) {
          console.log('zero');
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          cartContent.removeChild(removeItem.parentElement.parentElement);
          this.removeItem(id)
       }
     }
    
    
   })
  }

}
  







//local storage
class Storage {
static saveProducts(productList) {
  localStorage.setItem("products", JSON.stringify(productList))
}

static getProducts(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  return products.find(product => product.id === id);
}

static saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart))
}

static clearLocalStorage(cart) {
  localStorage.removeItem("cart");
};

static getCart() {
  return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [] };
};






document.addEventListener('DOMContentLoaded', () => {
  
 const ui = new UI();
 const products = new Products();

 ui.setupAPP();
 //get all products
 async function loadProducts () {
  try {
    let productList = await products.getProducts();
    ui.displayProducts(productList);
    Storage.saveProducts(productList);
    ui.getBagButton();
    ui.cartLogic();
    ui.updateAmount();
  } catch (error) {
    console.log(error)
  }
 }
 
 loadProducts();
 


 
});