include srcs/.env
export $(shell sed 's/=.*//' srcs/.env)

all:
	mkdir -p $(HOST_FRONTEND_PATH)
	mkdir -p $(HOST_BACKEND_PATH)
	mkdir -p $(HOST_DATABASE_PATH)
	docker compose -f ./srcs/docker-compose.yml up --build -d

clean:
	docker compose -f ./srcs/docker-compose.yml down -v

fclean: clean
	docker system prune -af --volumes
	rm -rf $(HOST_FRONTEND_PATH)/*
	rm -rf $(HOST_BACKEND_PATH)/*
	rm -rf $(HOST_DATABASE_PATH)/*

re: fclean all

.PHONY: all bonus clean fclean re
