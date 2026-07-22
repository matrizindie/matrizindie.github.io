document.addEventListener('DOMContentLoaded', () => {
    
    // Configurar resaltado de sintaxis para código si la librería cargó
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-'
        });
    }

    // Detectar en qué página está el usuario
    const postsContainer = document.getElementById('posts-list');
    const postContainer = document.getElementById('post-content');

    // 1. SI ESTAMOS EN LA PORTADA (index.html)
    if (postsContainer) {
        fetch('./posts.json')
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar posts.json');
                return res.json();
            })
            .then(posts => {
                if (posts.length === 0) {
                    postsContainer.innerHTML = '<p>Aún no hay publicaciones.</p>';
                    return;
                }

                postsContainer.innerHTML = posts.map(post => `
                    <article class="post-card">
                        <h3><a href="post.html?file=${post.slug}">${post.title}</a></h3>
                        <time>${post.date}</time>
                        <p>${post.description}</p>
                    </article>
                `).join('');
            })
            .catch(err => {
                console.error(err);
                postsContainer.innerHTML = '<p>Error al cargar la lista de artículos.</p>';
            });
    }

    // 2. SI ESTAMOS EN EL LECTOR DE POSTS (post.html)
    if (postContainer) {
        const params = new URLSearchParams(window.location.search);
        const postSlug = params.get('file');

        if (!postSlug) {
            postContainer.innerHTML = '<h2>Error: No se especificó ninguna publicación.</h2><a href="index.html">← Volver al inicio</a>';
            return;
        }

        // Descarga el archivo .md desde la carpeta /posts/
        fetch(`./posts/${postSlug}.md`)
            .then(res => {
                if (!res.ok) throw new Error(`El archivo posts/${postSlug}.md no existe`);
                return res.text();
            })
            .then(markdown => {
                // Transforma Markdown a HTML y lo inyecta
                postContainer.innerHTML = marked.parse(markdown);
                
                // Aplica estilos al código si los hay
                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            })
            .catch(err => {
                console.error(err);
                postContainer.innerHTML = '<h2>404: Publicación no encontrada</h2><p>Verifica que el nombre del archivo .md coincida con el slug en posts.json.</p><a href="index.html">← Volver al inicio</a>';
            });
    }
});