#!/bin/bash

# Buscar y eliminar todos los archivos .pyc
find . -name "*.pyc" -exec git rm --cached {} \;

