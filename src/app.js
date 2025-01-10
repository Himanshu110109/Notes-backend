const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "notesApp";

let db;

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

connectToDB();

// Routes

// Fetch all notes for a user
app.get("/notes/:userId", async (req, res) => {
    try {
        const notes = await db.collection("notes").find({ userId: req.params.userId }).toArray();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// Create a new note
app.post("/create-note", async (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) return res.status(400).json({ error: "User ID and content are required" });

    try {
        const result = await db.collection("notes").insertOne({ userId, content });
        res.status(201).json({ message: "Note created successfully", noteId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create note" });
    }
});

// Delete a note
app.delete("/delete-note/:id", async (req, res) => {
    try {
        const result = await db.collection("notes").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Note not found" });
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete note" });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
