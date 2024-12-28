FROM alpine:3.18.6

RUN apk update && apk upgrade \
  && apk add \
  grafana \
  && rm -rf /var/cache/apk/*

COPY grafana.ini /etc/grafana/grafana.ini

CMD ["/usr/sbin/grafana-server", "--config=/etc/grafana/grafana.ini", "--homepath=/usr/share/grafana"]
