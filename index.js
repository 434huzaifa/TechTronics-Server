const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
const app = express()

const port=process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = "mongodb+srv://434darkmaster:kCnhj5usUf3mXiDF@cluster0.l2bfny4.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req, res) => {
  res.send("Backend Running")
})

app.listen(port, () => { console.log(`Server Started`) })