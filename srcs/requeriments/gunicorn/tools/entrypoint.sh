#!/bin/sh

echo "Esperando a que PostgreSQL esté listo..."
until pg_isready -h postgre -U "$DB_USER" -d "$DB_NAME"; do
  sleep 1
done

echo "PostgreSQL está listo. Ejecutando migraciones..."
python /trascendence/manage.py makemigrations
python /trascendence/manage.py migrate
python /trascendence/manage.py create_users

echo "Iniciando Gunicorn..."
#exec trascendence/manage.py runserver 0.0.0.0:8081
exec gunicorn -b 0.0.0.0:8081 --chdir /trascendence trascendence.asgi:application -k uvicorn.workers.UvicornWorker
#exec "$@"
