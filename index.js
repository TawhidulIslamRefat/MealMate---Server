const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

/* middleWare */
app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcwgrle.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("MealMate");
    const foodCollection = db.collection("foods");

    // products API
    app.get("/foods", async (req, res) => {
      const search = req.query.search;
      const sort = req.query.sort;
      const email = req.query.email;

      let query = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (email) {
        query["postedBy.email"] = email;
      }
      const result = await foodCollection
        .find(query)
        .toArray();
      res.send(result);
    });

    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;

      let result = null;

      if (ObjectId.isValid(id)) {
        result = await foodCollection.findOne({ _id: new ObjectId(id) });
      }

      if (!result) {
        result = await foodCollection.findOne({ _id: id });
      }
      if (!result) {
        return res.status(404).send({ message: "food Not Found" });
      }
      res.send(result);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const newProduct = req.body;
      const result = await foodCollection.insertOne(newProduct);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Meal-Mate server is running on port :${port}`);
});