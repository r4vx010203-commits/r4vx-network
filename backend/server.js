const express = require("express");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// --- CONFIGURACIÓN DE MONGODB ATLAS (CONEXIÓN ETERNA) ---
const MONGO_URI = "mongodb+srv://admin:r4vx.123321@cluster0.zbiip.mongodb.net/r4vx_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log(">> DATABASE_CONNECTED_ETERNAL"))
    .catch(err => console.error(">> DATABASE_CONNECTION_ERROR:", err));

// Esquema de los posts para la base de datos
const PostSchema = new mongoose.Schema({
    text: String,
    date: String,
    image: String
});
const Post = mongoose.model("Post", PostSchema);

// Configuración de Multer para procesar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Obtener posts desde la nube (MongoDB)
app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ _id: -1 }); 
        res.json(posts);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 2. Publicar con subida a ImgBB y guardado en MongoDB
app.post("/publish", upload.single("image"), async (req, res) => {
    try {
        const { text, date } = req.body;
        let imageUrl = null;

        if (req.file) {
            const form = new FormData();
            form.append("image", req.file.buffer.toString("base64"));
            
            const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload?key=1974f36958f9e830f76b630a9f2a1fcd", form, {
                headers: { ...form.getHeaders() }
            });
            
            imageUrl = imgbbResponse.data.data.url;
        }

        const newPost = new Post({ text, date, image: imageUrl });
        await newPost.save();
        
        res.status(200).send({ status: "ok" });
    } catch (err) {
        console.error(">> SYSTEM_FAILURE:", err.message);
        res.status(500).send({ error: "UPLOAD_FAILED" });
    }
});

// 3. Eliminar post de la nube
app.delete("/delete-post", async (req, res) => {
    const { date } = req.body;
    try {
        await Post.deleteOne({ date: date });
        res.status(200).send({ status: "deleted" });
    } catch (err) {
        res.status(500).send({ error: "DELETE_FAILED" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> R4VX_SYSTEM_ONLINE: PORT ${PORT}`);
});
