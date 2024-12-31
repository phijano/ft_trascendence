FROM alpine:3.18.6
RUN apk -i update && apk -i upgrade \
  && apk -i add \
  postgresql \
  && rm -rf /var/cache/apk/*

RUN mkdir /run/postgresql \
  && chown postgres:postgres /run/postgresql

COPY ./tools/postgresql.sh /
RUN chmod +x postgresql.sh

USER postgres:postgres

RUN initdb -D /var/lib/postgresql/data

RUN echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

CMD ["/postgresql.sh"]
