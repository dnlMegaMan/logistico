#!/bin/bash

# Función para verificar si un comando está disponible
check_command() {
    command -v $1 >/dev/null 2>&1 || { echo >&2 "$1 no está instalado. Por favor, instale $1 antes de continuar."; exit 1; }
}

# Función para manejar errores
handle_error() {
    echo "Error: $1"
    exit 1
}

# Definir variables de ruta
GO_INSTALLER_URL="https://golang.org/dl/"
NVM_INSTALLER_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh"
REPO_URL="https://github.com/dnlMegaMan/Sonda-logistico.git"
REPO_FOLDER="logistico"
GO_INSTALLER_PATH="D:\workspace\go.msi"
NVM_DIR="D:\workspace\.nvm"
INSTANTCLIENT_DIR="D:\workspace\instantclient"
START_BAT="D:\workspace\start.bat"

# Verificar si Golang está instalado
check_command go

# Verificar si Node.js está instalado
check_command node

# Verificar si NPM está instalado
check_command npm

# Verificar si Angular CLI está instalado
check_command ng

# Función para instalar una versión específica de Golang
install_golang() {
    local version=$1
    echo "Descargando e instalando Golang $version..."
    curl -L "$GO_INSTALLER_URL/go$version.windows-amd64.msi" -o "$GO_INSTALLER_PATH" || handle_error "No se pudo descargar el instalador de Golang"
    msiexec /i "$GO_INSTALLER_PATH" || handle_error "No se pudo instalar Golang"
}

# Función para instalar una versión específica de Node.js y Angular CLI
install_node_and_angular() {
    local node_version=$1
    local ng_version=$2
    echo "Instalando Node.js $node_version y Angular CLI $ng_version..."
    nvm install "$node_version" || handle_error "No se pudo instalar Node.js"
    npm install -g "@angular/cli@$ng_version" || handle_error "No se pudo instalar Angular CLI"
}

# Verificar si se han especificado versiones de Golang, Node.js y Angular CLI
if [ $# -eq 3 ]; then
    GO_VERSION=$1
    NODE_VERSION=$2
    NG_VERSION=$3
else
    # Si no se especifican versiones, utilizar las versiones por defecto
    GO_VERSION="1.19.3"
    NODE_VERSION="16.18.1"
    NG_VERSION="8.3.29"
fi

# Descargar e instalar Golang si no está instalado o la versión no coincide
if [ "$(go version | awk '{print $3}')" != "go$GO_VERSION" ]; then
    install_golang "$GO_VERSION"
fi

# Descargar e instalar NVM si no está instalado
if ! nvm --version >/dev/null 2>&1; then
    echo "Descargando e instalando NVM..."
    curl -o- "$NVM_INSTALLER_URL" | bash || handle_error "No se pudo instalar NVM"
fi

# Instalar Node.js y Angular CLI si no están instalados o las versiones no coinciden
if [ "$(node --version | sed 's/v//')" != "$NODE_VERSION" ] || [ "$(ng version | grep angular/core | awk '{print $3}')" != "$NG_VERSION" ]; then
    install_node_and_angular "$NODE_VERSION" "$NG_VERSION"
fi

# Clonar el repositorio en la carpeta `logistico`
if [ ! -d "$REPO_FOLDER" ]; then
    echo "Clonando el repositorio en la carpeta '$REPO_FOLDER'..."
    git clone "$REPO_URL" "$REPO_FOLDER" || handle_error "No se pudo clonar el repositorio"
fi

# Cambiar al directorio del repositorio
cd "$REPO_FOLDER" || handle_error "No se pudo cambiar al directorio '$REPO_FOLDER'"

# Agregar variables de entorno al archivo `start.bat`
echo "set INSTANTCLIENT_DIR=%INSTANTCLIENT_DIR%" >> "$START_BAT" || handle_error "No se pudo agregar INSTANTCLIENT_DIR al archivo de inicio"
echo "set GOLANG_DIR=%GOLANG_DIR%" >> "$START_BAT" || handle_error "No se pudo agregar GOLANG_DIR al archivo de inicio"

# Iniciar el archivo `start.bat`
start "$START_BAT" || handle_error "No se pudo iniciar el archivo de inicio"
