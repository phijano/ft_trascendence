**Hata aqui cambios para chat basico**
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

**profile**
- `usermanagement/urls.py` añadido *profile* con argumento 
- `userManagement/view.py` modificado *profile* para un argumento o no

**settings**
- cambiado *MEDIA_ROOT = 'static_files/media'*, tenia dos *tt*