const productQueries = require('../database/queries/products.queries');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productQueries.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productQueries.getProductById(req.params.id);
    product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};