const express = require("express");
const cors = require("cors");
const {MongoClient}= require("mongodb");
const {objectId}=require("mongodb");
require('dotenv').config();

const app=express();
app.use(cors({
    origin: 'https://notes-app-v6x7.onrender.com/'
}));;
app.use(express.json());

const url = process.env.MONGO_URI;
const dbname='notesApp';
let db;

MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
.then((client)=>{
    db=client.db(dbname);
    console.log("connected to db")
})
.catch((error)=>{
    console.log("error connecting in db ",error);
});

const PORT=process.env.PORT || 7777;
app.listen(PORT,()=>{
    console.log("server is running on port "+PORT);
})

app.post('/create-note', async(req,res)=>{
    try{
        const {userId,content}=req.body;
        const notesCollection=db.collection("notes");
        const result= await notesCollection.insertOne({userId,content});
        res.status(201).json({message:"Note added successfully", noteId:result.insertedId});
    }catch(error){
        res.status(500).json({error:"failed to add note"});
    }
})

app.get("/notes/:userId", async function(req,res){
    try{
        const userId=req.params.userId;
        const notesCollection=db.collection("notes");
        const notes = await notesCollection.find({userId}).toArray();
        res.status(200).json(notes);
    } catch(error) {
        res.status(500).json({error:"failed to fetch notes"});
    }
});

app.delete("/delete-note/:id", async function(req,res){
    try{
        const noteId=req.params.id;
        const notesCollection=db.collection("notes");
        const result=await notesCollection.deleteOne({_id:new objectId(noteId)});
        if(result.deletedCount===0){
            res.status(404).json({error:"note not found"});
        }
        res.status(200).json({message:"note deleted successfully"});
    } catch(error) {
        res.status(500).json({error:"failed to delete note"});
    }
});
;
