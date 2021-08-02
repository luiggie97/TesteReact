import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, IconButton } from '@material-ui/core';
import { AddShoppingCart } from '@material-ui/icons';

import useStyles from './styles';

const Product = ({ product, onAddToCart }) => {
  const classes = useStyles();
  
  const handleAddToCart = () => onAddToCart(product.id, 1);

  return (
    <Card className={classes.root}>
      <CardMedia className={classes.media} image={product.media.source} title={product.name} />
      <CardContent>
        <div className={classes.cardContent}>
          <Typography gutterBottom variant="h5" component="h2">
            {product.name}
          </Typography>         
        </div>
        <div className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
            R$ {product.price.formatted}
        </Typography>
        </div>
        <div className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h4">
              {product.inventory.available} unidades
        </Typography>  
        </div>      
      </CardContent>
      <CardActions disableSpacing className={classes.cardActions}>        
        <IconButton aria-label="Add to Cart" onClick={handleAddToCart}>
          <AddShoppingCart />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default Product;

