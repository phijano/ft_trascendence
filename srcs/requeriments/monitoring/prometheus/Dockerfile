FROM alpine:3.18.6

RUN apk update && apk upgrade \
  && apk add \
  prometheus \
  && rm -rf /var/cache/apk/*

COPY prometheus.yml /etc/prometheus/prometheus.yml

CMD ["/usr/bin/prometheus", "--config.file=/etc/prometheus/prometheus.yml"]