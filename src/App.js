import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Navbar, Products, Cart, Checkout } from './components';
import { commerce } from './lib/commerce';
import axios from 'axios';

const App = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [order, setOrder] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
 
  /**
   * Check if already exists products in commerce js   * 
   */
  const checkProducts = async () => {
    const { data } = await commerce.products.list({
      limit:50
    });    
    if(data === undefined)
    {
      getProducts();
      setProducts(await commerce.products.list());    
    }
    else
      setProducts(data);    
  };
  

  /**
   * get all product that were give by endpoint: https://5d6da1df777f670014036125.mockapi.io/api/v1/product
   */
  const getProducts = async () => {
    axios.get(`https://5d6da1df777f670014036125.mockapi.io/api/v1/product`)
    .then(res => {                
      res.data.forEach(product => {
           addProduct(product)
      });
     
    }).catch(error =>{
        console.log("Ocorreu o seguinte erro ao buscar os dados: " + error);
    })    
  };

  /**
   * addProduct to commerce js
   * @param {*} productReceived 
   */
  const addProduct = async (productReceived) =>{
    const product = {
      name: productReceived.name,
      price: productReceived.price,   
      inventory: {
        managed: true,
        available: parseInt(productReceived.stock,10)
      },        
    };    
   
    axios.post(`https://api.chec.io/v1/products`, { product },{
      headers: {
        'X-Authorization': process.env.REACT_APP_SECRET_KEY
      }
    })
      .then(res => {      
        console.log(res.data)
        addAsset(productReceived,res.data.id);       
        console.log('produto criado');  
    })  
  };

  /**
   * Add the image as asset
   * @param {*} product 
   * @param {*} productId 
   */
  const addAsset = async (product, productId) => {
    axios.post(`https://api.chec.io/v1/assets`, { filename: product.id, url: product.image }, {
      headers: {
        'X-Authorization': process.env.REACT_APP_SECRET_KEY
      }
    })
    .then(res => {
      associateProductAsset(productId, res.data.id)              
      console.log('asset criado');
    })
  }

  /**
   * Associate the Product with Asset(Image)
   * @param {*} productId 
   * @param {*} assetId 
   */
  const associateProductAsset = async(productId, assetId)=>{
    const assets =[{
      id: assetId
    }]

    const url = "https://api.chec.io/v1/products/"+productId+"/assets";
    axios.post(url, { assets }, {
      headers: {
        'X-Authorization': process.env.REACT_APP_SECRET_KEY
      }
    })
    .then(res => {
      console.log(res.data)
      console.log('asset associado');    
    })

  }

  /**
   * Get the cart data from commerce js
   */
  const fetchCart = async () => {
    setCart(await commerce.cart.retrieve());
  };

  /**
   * Add the selected items to cart
   * @param {*} productId 
   * @param {*} quantity 
   */
  const handleAddToCart = async (productId, quantity) => {
    const item = await commerce.cart.add(productId, quantity);
    setCart(item.cart);
  };

  /**
   * Updates quantity of products in the cart
   * @param {*} lineItemId 
   * @param {*} quantity 
   */
  const handleUpdateCartQty = async (lineItemId, quantity) => {
    const response = await commerce.cart.update(lineItemId, { quantity });
    setCart(response.cart);
  };

  /**
   * Remove specified quantity from cart
   * @param {*} lineItemId 
   */
  const handleRemoveFromCart = async (lineItemId) => {
    const response = await commerce.cart.remove(lineItemId);
    setCart(response.cart);
  };

  /**
   * Clean the cart no matters how much items it has
   */
  const handleEmptyCart = async () => {
    const response = await commerce.cart.empty();
    setCart(response.cart);
  };

  /**
   * Refresh the cart
   */
  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();
    setCart(newCart);
  };

  /**
   * Capture the order Informations 
   * @param {*} checkoutTokenId 
   * @param {*} newOrder 
   */
  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(checkoutTokenId, newOrder);
      setOrder(incomingOrder);
      refreshCart();
    } catch (error) {
      setErrorMessage(error.data.error.message);
    }
  };

  useEffect( () => {
    checkProducts();    
    fetchCart();
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Router>
       <div style={{ display: 'flex' }}>
        <CssBaseline />
        <Navbar totalItems={cart.total_items} handleDrawerToggle={handleDrawerToggle} />
        <Switch>
          <Route exact path="/">
            <Products products={products} onAddToCart={handleAddToCart} handleUpdateCartQty />
          </Route>
          <Route exact path="/cart">
            <Cart cart={cart} onUpdateCartQty={handleUpdateCartQty} onRemoveFromCart={handleRemoveFromCart} onEmptyCart={handleEmptyCart} />
          </Route>
          <Route path="/checkout" exact>
            <Checkout cart={cart} order={order} onCaptureCheckout={handleCaptureCheckout} error={errorMessage} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
