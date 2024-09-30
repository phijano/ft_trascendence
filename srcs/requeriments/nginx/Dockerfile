FROM alpine:3.18.6

RUN apk -i update && apk -i upgrade \
  && apk -i add \
  nginx \
  openssl \
  && rm -rf /var/cache/apk/*

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./tools/ssl_nginx.sh /

RUN chmod +x ssl_nginx.sh

RUN	mkdir -p /var/run/nginx

CMD ["/ssl_nginx.sh"]
