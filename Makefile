all:
	docker compose -f ./srcs/docker-compose.yml up --build -d

clean:
	docker compose -f ./srcs/docker-compose.yml down -v

fclean: clean
	docker system prune -af --volumes
#	rm -rf /home/phijano-/data/frontend/*
#	rm -rf /home/phijano-/data/backend/*
#	rm -rf /home/phijano-/data/database/*

re: fclean all

.PHONY: all bonus clean fclean re
