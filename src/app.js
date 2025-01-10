const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(
    cors({
        origin: "https://notes-app-v6x7.onrender.com", // Removed trailing slash
    })
);
app.use(express.json());

const url = process.env.MONGO_URI;
const dbName = "notesApp";
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        db = client.db(dbName);
        console.log("Connected to database");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

app.post("/create-note", async (req, res) => {
    try {
        const { userId, content } = req.body;
        const notesCollection = db.collection("notes");
        const result = await notesCollection.insertOne({ userId, content });
        res.status(201).json({ message: "Note added successfully", noteId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to add note" });
    }
});

app.get("/notes/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const notesCollection = db.collection("notes");
        const notes = await notesCollection.find({ userId }).toArray();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.delete("/delete-note/:id", async (req, res) => {
    try {
        const noteId = req.params.id;
        const notesCollection = db.collection("notes");
        const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });

        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Note not found" });
        } else {
            res.status(200).json({ message: "Note deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete note" });
    }
});
