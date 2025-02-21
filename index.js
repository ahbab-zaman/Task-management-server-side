require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;
const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.73pqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const tasksCollection = client.db("tasksDB").collection("tasks");
const userCollection = client.db("tasksDB").collection("users");

async function run() {
  try {
    // await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/addTask", async (req, res) => {
      const query = req.body;
      const result = await tasksCollection.insertOne(query);
      res.send(result);
    });

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await tasksCollection.find(query).toArray();
      res.send(result);
    });
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedTask = req.body;
      const query = {
        $set: {
          name: updatedTask.name,
          description: updatedTask.description,
          category: updatedTask.category,
        },
      };
      const result = await tasksCollection.updateOne(filter, query);
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(cursor);
      res.send(result);
    });

    app.post("/addUser", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already Existed", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Manager is running");
});

app.listen(port, () => {
  console.log("Task manager is managing tasks on port", port);
});
