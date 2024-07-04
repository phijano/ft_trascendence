Developing usage:

make
docker exec -it gunicorn sh
python3 /trascendence/manage.py runserver 0.0.0.0:8082
In browser: http://localhost:8082
