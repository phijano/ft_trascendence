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
  && rm -rf /var/cache/apk/*

# Install Python packages
RUN pip install uvicorn[standard]
RUN pip install psycopg[binary] channels daphne
RUN pip install django_prometheus

# Configure Vim (optional)
COPY ./vim/conf /
RUN cat conf >> /etc/vim/vimrc

# Create test project
RUN django-admin startproject dummy

# Copy project
RUN mkdir /trascendence
COPY ./proyect/ /trascendence/

# Run Django commands ensuring PostgreSQL is ready
RUN python3 /trascendence/manage.py collectstatic --noinput
#RUN python3 /trascendence/manage.py makemigrations
#RUN python3 /trascendence/manage.py migrate

# Copy startup script
COPY ./tools/django.sh /django.sh
RUN chmod +x /django.sh

# Default command
CMD ["/django.sh"]


#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "dummy", "dummy.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#remove reload when finished
#CMD ["gunicorn", "-b", "0.0.0.0:8080", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker"]
