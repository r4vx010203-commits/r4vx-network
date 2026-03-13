const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Soporte para JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANTE: Servir el frontend correctamente
app.use(express.static(path.join(__dirname, "../frontend")));

const postsPath = path.join(__dirname, "../database/posts.json");

// Ruta principal para cargar la web
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/posts", (req, res) => {
    if (!fs.existsSync(postsPath)) return res.json([]);
    const data = fs.readFileSync(postsPath, "utf8");
    res.json(JSON.parse(data));
});

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

// RUTA PARA ELIMINAR POSTS (Añade esto arriba de const PORT)
app.delete("/delete-post", (req, res) => {
    const { date } = req.body; // Recibimos la fecha del post a borrar
    try {
        if (fs.existsSync(postsPath)) {
            let posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
            
            // Filtramos: se quedan todos los posts EXCEPTO el que coincide con la fecha
            const updatedPosts = posts.filter(post => post.date !== date);
            
            // Guardamos la nueva lista en el archivo JSON
            fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2));
            console.log(`>> POST_DELETED: ${date}`);
            return res.status(200).send({ status: "deleted" });
        }
        res.status(404).send({ error: "FILE_NOT_FOUND" });
    } catch (err) {
        console.error("ERROR_DELETING:", err);
        res.status(500).send({ error: "DELETE_FAILED" });
    }
});

// EL ARREGLO PARA RENDER:
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> R4VX_SYSTEM_ONLINE_ON_PORT_${PORT}`);
});

