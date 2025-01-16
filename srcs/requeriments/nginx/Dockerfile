FROM alpine:3.18.6

RUN apk update && apk upgrade && apk add --no-cache bash nginx openssl

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./tools/ssl_nginx.sh /

RUN chmod +x /ssl_nginx.sh

RUN mkdir -p /var/run/nginx

CMD ["/ssl_nginx.sh"]