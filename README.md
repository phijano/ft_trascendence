Developing usage:
<br>
make
<br>
docker exec -it gunicorn sh
<br>
python3 /trascendence/manage.py runserver 0.0.0.0:8082
<br>
In browser: http://localhost:8082


# Listado de puertos
                  Navegador         Docker
nginx           localhost:8080	Proxy a otros servicios
prometheus      localhost:9090	http://prometheus:9090
grafana         localhost:3000	http://grafana:3000
gunicorn	    localhost:8082	http://gunicorn:8081
node-exporter   localhost:9100	http://srcs-node_exporter-1:9100
postgres        No expuesto     http://postgre:5432
