# Base Image
FROM alpine:3.18.6

# Instalar dependencias
RUN apk -i update && apk -i upgrade \
  && apk -i add \
  python3 \
  py3-django \
  py3-gunicorn \
  py3-pip \
  postgresql-client \
  vim \
  && rm -rf /var/cache/apk/*

# Instalar paquetes de Python
RUN pip install uvicorn[standard]
RUN pip install psycopg[binary] channels daphne

# Configurar Vim (opcional)
COPY ./vim/conf /
RUN cat conf >> /etc/vim/vimrc

# Crear proyecto de prueba
RUN django-admin startproject dummy

# Copiar proyecto
RUN mkdir /trascendence
COPY ./proyect/ /trascendence/

# Ejecutar comandos de Django asegurando que PostgreSQL esté listo
RUN python3 /trascendence/manage.py collectstatic --noinput
#RUN python3 /trascendence/manage.py makemigrations
#RUN python3 /trascendence/manage.py migrate

# Copiar script de arranque
COPY ./tools/django.sh /django.sh
RUN chmod +x /django.sh

# Comando predeterminado
CMD ["/django.sh"]


#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "dummy", "dummy.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#remove reload when finished
#CMD ["gunicorn", "-b", "0.0.0.0:8080", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker"]
