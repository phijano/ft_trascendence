FROM alpine:3.18.6
RUN apk -i update && apk -i upgrade \
  && apk -i add \
  python3 \
  py3-django \
  py3-gunicorn \
  py3-pip \
  && rm -rf /var/cache/apk/*

RUN pip install uvicorn

#postgresql 
RUN pip install psycopg[binary]



# Development things
RUN apk -i add vim
COPY ./vim/conf /
RUN cat conf >> etc/vim/vimrc

#RUN django-admin startproject trascendence
RUN django-admin startproject dummy
#
RUN mkdir /trascendence
COPY ./proyect/ /trascendence/

CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "dummy", "dummy.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#CMD ["gunicorn", "-b", "0.0.0.0:8081", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--access-logfile", "/var/log/access.log", "--error-logfile", "/var/log/error.log"]
#remove reload when finished
#CMD ["gunicorn", "-b", "0.0.0.0:8080", "--chdir", "trascendence", "trascendence.asgi:application", "-k", "uvicorn.workers.UvicornWorker"]
