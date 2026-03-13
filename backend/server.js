const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer"); // Nueva librería
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Servir el frontend y la carpeta de subidas
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "../frontend/uploads")));

const postsPath = path.join(__dirname, "../database/posts.json");

// 2. Configuración de Multer (Donde se guardan las fotos)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../frontend/uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 3. Rutas
app.get("/posts", (req, res) => {
    if (!fs.existsSync(postsPath)) return res.json([]);
    const data = fs.readFileSync(postsPath, "utf8");
    res.json(JSON.parse(data));
});

// NUEVA RUTA DE PUBLICACIÓN (Acepta archivos)
app.post("/publish", upload.single("image"), (req, res) => {
    try {
        const { text, date } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        let posts = [];
        if (fs.existsSync(postsPath)) {
            posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
        }
        posts.unshift({ text, date, image: imageUrl });
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
        
        res.status(200).send({ status: "ok" });
    } catch (err) {
        res.status(500).send({ error: "UPLOAD_ERROR" });
    }
});

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
