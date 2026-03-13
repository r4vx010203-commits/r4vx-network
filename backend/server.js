const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir el frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const postsPath = path.join(__dirname, "../database/posts.json");

// Configuración de Multer para usar MEMORIA (evita que Render borre archivos locales)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Obtener posts
app.get("/posts", (req, res) => {
    if (!fs.existsSync(postsPath)) return res.json([]);
    const data = fs.readFileSync(postsPath, "utf8");
    res.json(JSON.parse(data));
});

// 2. Publicar con subida directa a ImgBB
app.post("/publish", upload.single("image"), async (req, res) => {
    try {
        const { text, date } = req.body;
        let imageUrl = null;

        // Si el usuario subió una imagen, la enviamos a ImgBB
        if (req.file) {
            const form = new FormData();
            // Convertimos el buffer de la imagen a Base64 para ImgBB
            form.append("image", req.file.buffer.toString("base64"));
            
            // Reemplaza 'TU_API_KEY_AQUI' con la clave que copiaste de https://api.imgbb.com/
            const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload?key=1974f36958f9e830f76b630a9f2a1fcd", form, {
                headers: { ...form.getHeaders() }
            });
            
            imageUrl = imgbbResponse.data.data.url; // Esta URL es permanente
        }

        let posts = [];
        if (fs.existsSync(postsPath)) {
            posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
        }
        
        posts.unshift({ text, date, image: imageUrl });
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
        
        res.status(200).send({ status: "ok" });
    } catch (err) {
        console.error(">> ERROR_IMGBB_UPLOAD:", err.message);
        res.status(500).send({ error: "UPLOAD_FAILED" });
    }
});

// 3. Eliminar post
app.delete("/delete-post", (req, res) => {
    const { date } = req.body;
    if (fs.existsSync(postsPath)) {
        let posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
        const updatedPosts = posts.filter(post => post.date !== date);
        fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2));
        res.status(200).send({ status: "deleted" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> SYSTEM_ARMED: PORT ${PORT}`);
});

