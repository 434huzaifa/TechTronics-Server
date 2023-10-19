const express=require('express')
const cors=require('cors');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app=express()
const port=5000
app.use(express.json())
app.use(cors());



const uri = "mongodb+srv://434darkmaster:kCnhj5usUf3mXiDF@cluster0.l2bfny4.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database=client.db("Techtronics");
    const etCollection=database.collection("etCollection");
    const brandCollection=database.collection("brands");

    app.get('/brands',async (req,res)=>{
      const info=await brandCollection.find().toArray()
      res.send(info)
    })

    app.post('/product',async(req,res)=>{
      const product=req.body
      const result=await etCollection.insertOne(product)
      res.send(result)
    })
    app.get('/product/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result=await etCollection.findOne(query)
      res.send(result)
    })
    app.put('/product/:id',async (req,res)=>{ 
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const options={upsert:true}
      const product=req.body
      console.log(product)
      const updatePorduct={
        $set:{
          company:product.company,
          image:product.image,
          name:product.name,
          price:product.price,
          rating:product.rating,
          type:product.type,
        }
      }
      const result=await etCollection.updateOne(query,updatePorduct,options)
      res.send(result)
    })
    app.get('/products',async(req,res)=>{
      res.send(await etCollection.find().toArray())
    })
    
    app.get('/company/:id',async(req,res)=>{
      const id=req.params.id
      const query={company:id} 
      const products=etCollection.find(query)
      const result=await products.toArray()
      const query2={_id:new ObjectId(id)}
      const company= await brandCollection.findOne(query2)
      res.send([result,company]) 
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{console.log(`Server Started`)})