// 1. Función para cargar y mostrar los posts
const loadR4VXFeed = () => {
    fetch("/posts")
    .then(res => res.json())
    .then(data => {
        let feed = document.getElementById("feed");
        feed.innerHTML = ""; 

        data.forEach(post => {
            let div = document.createElement("div");
            div.className = "post-card";

            div.innerHTML = `
                <div class="post-header">
                    <span class="status-dot"></span>
                    <small class="post-date">[ ${post.date || 'DATETIME_UNKNOWN'} ]</small>
                    <button class="delete-btn" onclick="deletePost('${post.date}')"> [X] </button>
                </div>
                <div class="post-content">
                    <p class="post-text">${post.text}</p>
                    ${post.image ? `<div class="post-media"><img src="${post.image}"></div>` : ""}
                </div>
                <div class="post-footer">
                    <small style="opacity:0.5">#${Math.random().toString(16).slice(2, 8).toUpperCase()}</small>
                </div>
            `;
            feed.appendChild(div);
        });
    })
    .catch(err => {
        document.getElementById("feed").innerHTML = ">> ERROR: DATABASE_OFFLINE";
    });
};

// 2. Función para inyectar/publicar un nuevo post
const publishPost = async () => {
    const text = document.getElementById("post-text").value;
    const imageInput = document.getElementById("post-image"); // Asegúrate de que este ID sea el del <input type="file">

    if (!text) return alert(">> ERROR: EMPTY_PAYLOAD");

    // Usamos FormData para enviar el archivo
    const formData = new FormData();
    formData.append("text", text);
    formData.append("date", new Date().toLocaleString());
    
    if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
    }

    try {
        const response = await fetch("/publish", {
            method: "POST",
            body: formData // No necesita headers de Content-Type, el navegador lo pone solo
        });

        if (response.ok) {
            document.getElementById("post-text").value = "";
            imageInput.value = "";
            loadR4VXFeed(); 
        }
    } catch (err) {
        console.error(">> UPLOAD_FAILED:", err);
    }
};

// 3. Función para eliminar un post
const deletePost = async (postDate) => {
    if (!confirm(">> ELIMINAR?")) return;

    try {
        const response = await fetch("/delete-post", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: postDate })
        });

        if (response.ok) {
            loadR4VXFeed(); 
        }
    } catch (err) {
        console.error(">> DELETE_FAILED:", err);
    }
};

// 4. Ejecución inicial

loadR4VXFeed();
