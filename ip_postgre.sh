#!/bin/bash

# Obtener la dirección IP del contenedor Docker "postgre"
ip_address=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgre)
host_name="postgre"

# Verificar si se obtuvo una IP válida
if [ -z "$ip_address" ]; then
  echo "Error: No se pudo obtener la IP del contenedor 'postgre'."
  exit 1
fi

# Verificar si ya existe una entrada para el host en /etc/hosts
if grep -q "$host_name" /etc/hosts; then
  # Verificar si la IP existente es diferente de la nueva IP
  existing_ip=$(grep "$host_name" /etc/hosts | awk '{print $1}')
  if [ "$existing_ip" != "$ip_address" ]; then
    # Si la IP es diferente, eliminar la línea existente
    echo "Se encontró una entrada antigua para '$host_name' con IP $existing_ip. Será eliminada."
    sudo sed -i.bak "/$host_name/d" /etc/hosts
  else
    # Si la IP es la misma, no se hace nada
    echo "La entrada '$ip_address $host_name' ya existe en /etc/hosts. No se realizará ningún cambio."
    exit 0
  fi
fi

# Agregar la nueva IP y el nombre de host al archivo /etc/hosts
echo "$ip_address $host_name" | sudo tee -a /etc/hosts > /dev/null
echo "La IP $ip_address ha sido agregada a /etc/hosts con el nombre '$host_name'."

