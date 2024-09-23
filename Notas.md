**Hata aqui cambios para chat basico**

- `/userManagement/views/` he añadido una nueva funcion llamada **Profiles**, con `S`, para no modificar la que ya existe y que me sirva para el chat, basicamente hace lo mismo pero requiere argumentos (username)

- Creado /userManagement/templates/`profiles.html`
- Creado carpeta en transcendent/templates/`includes/header.html`
- Creado carpeta en transcendent/templates/`includes/messages.html`
- Creado carpeta en transcendent/templates/`layaouts/base.html` falta añadir base
- Creado carpeta en transcendent/templates/`layaouts/blank.html`
- Instalado **django-htmx** con Dockerfile y otras dependencias
- `El dibujo del avatar no se carga`
- `El nombre tampoco carga`

**Agregamos daphne y channels layers**

- cambiamos `daphe` como primera aplicacion en `transcendent/settings.py`
- pequeñas modificaciones en `transcendent/asgi.py` para websocket en el chat