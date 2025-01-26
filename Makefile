include .env
export $(shell sed 's/=.*//' .env)

all: .docker_up

.docker_up:
	
	mkdir -p $(HOST_STATIC_PATH); 
	mkdir -p $(HOST_BACKEND_PATH); 
	mkdir -p $(HOST_DATABASE_PATH); 
	mkdir -p $(HOST_PROMETHEUS_DATA_PATH); 
	mkdir -p $(HOST_GRAFANA_DATA_PATH); 
	docker compose -f ./docker-compose.yml up --build -d; 
	

clean:
	docker compose -f ./docker-compose.yml down -v

fclean: clean
	docker system prune -af --volumes
#	rm -rf $(HOST_STATIC_PATH)/*
#	rm -rf $(HOST_BACKEND_PATH)/*
#	rm -rf $(HOST_DATABASE_PATH)/*
#	rm -rf $(HOST_PROMETHEUS_DATA_PATH)/*
#	rm -rf $(HOST_GRAFANA_DATA_PATH)/*

re: fclean all

stop:
	docker compose -f ./docker-compose.yml stop

restart:
	docker compose -f ./docker-compose.yml restart

.PHONY: all clean fclean re stop restart