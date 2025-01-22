Developing usage:
<br>
make
<br>
docker exec -it gunicorn sh
<br>
python3 /trascendence/manage.py runserver 0.0.0.0:8082dock
<br>
In browser: http://localhost:8082


# URL List

web         https://localhost:8080
grafana     https://localhost:8080/grafana/    # Use the trailing slash
prometheus  https://localhost:8080/prometheus/graph   // Estatus/target
connect grafana with prometheus http://prometheus:9090
Import dashboard 11074 or 1804 for Node-exporter


