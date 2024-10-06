#!/bin/bash

# Elimina contenedores detenidos
echo "Eliminando contenedores detenidos..."
docker container prune -f

# Elimina imágenes no usadas (dangling)
echo "Eliminando imágenes no usadas (dangling)..."
docker image prune -f

# Elimina todas las imágenes no usadas
echo "Eliminando todas las imágenes no usadas..."
docker image prune -a -f

# Elimina volúmenes no usados
echo "Eliminando volúmenes no usados..."
docker volume prune -f

# Elimina redes no usadas
echo "Eliminando redes no usadas..."
docker network prune -f

# Limpia todo: contenedores, imágenes, volúmenes y redes no usados
echo "Limpieza completa de contenedores, imágenes, volúmenes y redes no usados..."
docker system prune -f

# Limpia todo, incluidas imágenes no usadas y volúmenes no utilizados
echo "Limpieza completa, incluidas imágenes no usadas y volúmenes no utilizados..."
docker system prune -a --volumes -f

echo "Limpieza completada."

# Elimina la carpeta de certificados
rm -rf ./srcs/requirements/nginx/ssl

# Eliminar volumenes a fondo
docker volume rm $(docker volume ls -q)

# Eliminar carpeta data
rm -rf /home/rdelicad/data
