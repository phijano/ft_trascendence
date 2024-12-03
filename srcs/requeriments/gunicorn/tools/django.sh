#!/bin/sh

python3 /trascendence/manage.py migrate

#exec gunicorn -b 0.0.0.0:8081 --chdir trascendence trascendence.asgi:application -k uvicorn.workers.UvicornWorker --access-logfile /var/log/access.log --error-logfile /var/log/error.log
exec gunicorn -b 0.0.0.0:8081 --chdir dummy dummy.asgi:application -k uvicorn.workers.UvicornWorker --access-logfile /var/log/access.log --error-logfile /var/log/error.log
