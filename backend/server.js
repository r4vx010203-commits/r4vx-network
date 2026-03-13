const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const postsPath = path.join(__dirname, "../database/posts.json");

// Ruta para obtener posts
app.get("/posts", (req, res) => {
    if (!fs.existsSync(postsPath)) return res.json([]);
    const data = fs.readFileSync(postsPath, "utf8");
    res.json(JSON.parse(data));
});

// Ruta para publicar
app.post("/publish", (req, res) => {
    try {
        const newPost = req.body;
        let posts = [];
        if (fs.existsSync(postsPath)) {
            posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
        }
        posts.unshift(newPost);
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
        res.status(200).send({ status: "ok" });
    } catch (err) {
        res.status(500).send({ error: "INTERNAL_ERROR" });
    }
});

// --- ESTA ES LA RUTA QUE TE FALTABA PARA ELIMINAR ---
app.delete("/delete-post", (req, res) => {
    const { date } = req.body;
    try {
        if (fs.existsSync(postsPath)) {
            let posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
            
            // Filtra: mantiene todos menos el que coincida con la fecha exacta
            const updatedPosts = posts.filter(post => post.date !== date);
            
            fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2));
            console.log(`>> DELETED_POST: ${date}`);
            return res.status(200).send({ status: "deleted" });
        }
        res.status(404).send({ error: "FILE_NOT_FOUND" });
    } catch (err) {
        console.error("DELETE_ERROR:", err);
        res.status(500).send({ error: "DELETE_FAILED" });
    }
});

// Configuración para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> R4VX_SYSTEM_ONLINE_ON_PORT_${PORT}`);
});
