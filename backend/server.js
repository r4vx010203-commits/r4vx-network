const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// CRÍTICO: Estas dos líneas permiten que el servidor entienda los datos que envías
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const postsPath = path.join(__dirname, "../database/posts.json");

// Ruta para obtener los posts
app.get("/posts", (req, res) => {
    if (!fs.existsSync(postsPath)) return res.json([]);
    const data = fs.readFileSync(postsPath, "utf8");
    res.json(JSON.parse(data));
});

// RUTA DE INYECCIÓN: Aquí es donde ocurre la magia
app.post("/publish", (req, res) => {
    try {
        const newPost = req.body;
        
        // Leer base de datos actual
        let posts = [];
        if (fs.existsSync(postsPath)) {
            const fileData = fs.readFileSync(postsPath, "utf8");
            posts = JSON.parse(fileData);
        }

        // Insertar al inicio para que aparezca primero
        posts.unshift(newPost);

        // Guardar permanentemente
        fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
        
        console.log(">> DATA_INJECTED_SUCCESSFULLY");
        res.status(200).send({ status: "ok" });
    } catch (err) {
        console.error(">> INJECTION_FAILED:", err);
        res.status(500).send({ error: "INTERNAL_SERVER_ERROR" });
    }
});

app.listen(3000, () => {
    console.log("========================================");
    console.log("R4VX SYSTEM ONLINE - PORT 3000");
    console.log("========================================");
});