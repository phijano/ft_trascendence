# Base Image
FROM alpine:3.18.6

# Install dependencies
RUN apk -i update && apk -i upgrade \
  && apk -i add \
  python3 \
  py3-django \
  py3-gunicorn \
  py3-pip \
  postgresql-client \
  vim \
  curl \
  && rm -rf /var/cache/apk/*

# Install Python packages
RUN pip install uvicorn[standard] psycopg[binary] channels daphne django_prometheus

# Copy project
RUN mkdir /trascendence
COPY ./proyect/ /trascendence/

# Copy startup script
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN python3 /trascendence/manage.py collectstatic --noinput

# Default command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "/trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker"]



#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "dummy", "dummy.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#remove reload when finished
#CMD ["gunicorn", "-b", "0.0.0.0:8080", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker"]
