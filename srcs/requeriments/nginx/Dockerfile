FROM alpine:3.18.6

RUN apk update && apk upgrade && apk add --no-cache bash nginx openssl

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./tools/ssl_nginx.sh /
COPY ./tools/wait-for-it.sh /wait-for-it.sh

RUN chmod +x /ssl_nginx.sh /wait-for-it.sh

RUN mkdir -p /var/run/nginx

CMD ["/wait-for-it.sh", "prometheus:9090", "--", "/ssl_nginx.sh"]