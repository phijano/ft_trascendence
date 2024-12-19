import routes from "./routes.js"

export async function router(href) {
    if (href != window.location.href) {
        window.history.pushState({}, "", href);
    }
    await locationHandler();
};

export const locationHandler = async() => {
    let location = window.location.pathname;
    if (location.length != 1 & location.endsWith('/')) {
        location = location.substring(0, location.length - 1);
        window.history.replaceState({}, "", location);
    }
    /* console.log("handler: " + location) */
    const route = routes.URL[location] || routes.URL["404"];
    const origin = window.location.origin;
    const search = window.location.search;
    /* console.log(route);
    console.log(route.template); */
    try {
        const html = await fetch(origin + route.template + search).then((response) => response.text());
        document.getElementById("content").innerHTML = html;

        // Cargar el script chat.js solo para la ruta /chat
        if (location === "/chat") {
            const script = document.createElement('script');
            script.src = "/static/chat/chat.js";
            script.onload = () => {
                window.initializeChat(); // Ahora la función está disponible globalmente
            };
            document.body.appendChild(script);
        }
    } catch (e) {
        /* console.log(e); */
    }
    document.title = route.title;
/*	document
        .querySelector('meta[name="description"]')
        .setAttribute("content", route.description);
*/
    console.log("pagina cargada: ");
};

async function buttonRouter(ref)
{
    await router(window.location.origin + ref);
}

window.router = buttonRouter
window.onpopstate = locationHandler

/* function initializeChat() {
    console.log("Inicializando chat...");
    const btnMessage = document.getElementById('btnMessage');
    console.log(btnMessage);  // Para ver si el botón se encuentra correctamente
    if (btnMessage) {
        btnMessage.addEventListener('click', function() {
            console.log('Enviando mensaje...');
        });
    } else {
        console.error('Elemento con ID "btnMessage" no encontrado.');
    }
} */
