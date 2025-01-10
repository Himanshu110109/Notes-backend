const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7777;
const url = process.env.MONGO_URI;
const dbName = "notesApp";
let db;

// Middleware
app.use(cors({ origin: "https://notes-app-v6x7.onrender.com" }));
app.use(express.json());

// Database Connection
(async () => {
    try {
        const client = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = client.db(dbName);
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1); // Exit the application if DB connection fails
    }
})();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Routes
// Create Note
app.post("/create-note", async (req, res) => {
    try {
        const { userId, content } = req.body;

        // Validate Input
        if (!userId || !content) {
            return res.status(400).json({ error: "userId and content are required" });
        }

        const notesCollection = db.collection("notes");
        const result = await notesCollection.insertOne({ userId, content });
        res.status(201).json({
            message: "Note added successfully",
            noteId: result.insertedId,
        });
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ error: "Failed to add note" });
    }
});

// Get Notes by User ID
app.get("/notes/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate Input
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const notesCollection = db.collection("notes");
        const notes = await notesCollection.find({ userId }).toArray();
        if (notes.length === 0) {
            return res.status(404).json({ error: "No notes found for this user" });
        }
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// Delete Note
app.delete("/delete-note/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid note ID" });
        }

        const notesCollection = db.collection("notes");
        const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Notes App API is running!" });
});
