const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const Uri = 'mongodb://localhost:27017/productsdb';

mongoose.connect(Uri)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, required: true, default: true }
});

const Product = mongoose.model('Product', productSchema);

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
app.get('/', (req, res) => {
    res.send('Hello, world.')});       

app.get('/products', async (req, res) => {
    try {
        console.log('GET /products - Fetching all products from MongoDB');
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`GET /products/${id} - Fetching product by ID from MongoDB`);
        const product = await Product.findById(id);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

app.post('/products', async (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    console.log('POST /products - Creating new product with data:', req.body);

    if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
        return res.status(400).json({ message: 'Missing or invalid product fields. Required: name (string), description (string), price (number), category (string), inStock (boolean).' });
    }

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            inStock
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: savedProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    console.log(`PUT /products/${id} - Updating product with data:`, updateData);

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (updatedProduct) {
            res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`DELETE /products/${id} - Deleting product by ID from MongoDB`);
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (deletedProduct) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Products API listening at http://localhost:${port}`);
    console.log('Available routes:');
    console.log('  GET /products');
    console.log('  GET /products/:id');
    console.log('  POST /products');
    console.log('  PUT /products/:id');
    console.log('  DELETE /products/:id');
});
