const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
const dotenv=require("dotenv")
dotenv.config()
const app = express()
const port=process.env.PORT || 5000

app.use(cors()); 
app.use(express.json())

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.l2bfny4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("Techtronics");
    const etCollection = database.collection("etCollection");
    const brandCollection = database.collection("brands");
    const cartCollection = database.collection("cart");
    app.get('/brands', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const data=brandCollection.find()
      const info = await data.toArray()
      res.send(info)
    })
    app.get('/cartitem/:email', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const email = req.params.email
      const query = { email: email }
      const cartProduct = await cartCollection.find(query).toArray()
      res.send({ itemNumber: cartProduct.length })
    })
    app.delete('/cart/:id',async (req,res)=>{
      const id=req.params.id;
      const query ={_id:new ObjectId(id)}
      const result= await cartCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/cart/:email', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const email = req.params.email
      console.log(email)
      const query = { email: email }
      const cartProduct = await cartCollection.find(query).toArray()
      
      const product = new Array()
      for (let index = 0; index < cartProduct.length; index++) {
        const element = cartProduct[index];
        const query = { _id: new ObjectId(element.productId) }
        let result = await etCollection.findOne(query)
        const query2 = { _id: new ObjectId(result.company) }
        const result2 = await brandCollection.findOne(query2)
        result.company=result2?.name
        result.cartId=element._id;  
        if (result) {
          product.push(result)
        }
      }
      res.send(product)
    })
    app.post('/cart', async (req, res) => {
      const cart = req.body
      const result = await cartCollection.insertOne(cart)
      res.send(result)
    })

    app.post('/product', async (req, res) => {
      const product = req.body
      const result = await etCollection.insertOne(product)
      res.send(result)
    })
    app.get('/product/:id', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await etCollection.findOne(query)
      res.send(result)
    })
    app.get('/popular', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const result = etCollection.find().sort({ price: 1, rating: -1 }).limit(4)
      const products = await result.toArray()
      res.send(products)
    })
    app.get('/search/:name', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const name = req.params.name
      const query = { name: new RegExp(name, "i") }
      const result = await etCollection.find(query).toArray()
      res.send(result)
    })
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const product = req.body
      console.log(product)
      const updatePorduct = {
        $set: {
          company: product.company,
          image: product.image,
          name: product.name,
          price: product.price,
          rating: product.rating,
          type: product.type,
        }
      }
      const result = await etCollection.updateOne(query, updatePorduct, options)
      res.send(result)
    })
    app.get('/products', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const data=etCollection.find()
      const result=await data.toArray()
      res.send(result)
    })

    app.get('/company/:id', async (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const id = req.params.id
      const query = { company: id }
      const products = etCollection.find(query)
      const result = await products.toArray()
      const query2 = { _id: new ObjectId(id) }
      const company = await brandCollection.findOne(query2)
      res.send([result, company])
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.get('/',(req, res) => {
  res.send("Backend Running")
})

app.listen(port, () => { console.log(`Server Started`) })
