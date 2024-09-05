#!/bin/sh

sed -i "s/my_secret_key/$SECRET_KEY/" /trascendence/trascendence/settings.py

sed -i "s/my_db_name/$DB_NAME/" /trascendence/trascendence/settings.py
sed -i "s/my_db_user/$DB_USER/" /trascendence/trascendence/settings.py
sed -i "s/my_db_password/$DB_PASSWORD/" /trascendence/trascendence/settings.py

#fix when finish in a single one !!!It will trigger github guardian!!!
sed -i "s/my_email_host_user_one/$EMAIL_HOST_USER_ONE/" /trascendence/trascendence/settings.py
sed -i "s/my_email_host_user_two/$EMAIL_HOST_USER_TWO/" /trascendence/trascendence/settings.py
sed -i "s/my_email_host_password/$EMAIL_HOST_PASSWORD/" /trascendence/trascendence/settings.py

exec gunicorn -b 0.0.0.0:8081 --chdir dummy dummy.asgi:application -k uvicorn.workers.UvicornWorker --access-logfile /var/log/access.log --error-logfile /var/log/error.log
