<p align="left">
  <img src="./src/assets/logo.png" height="150" alt="logo-empresa"/>
</p>

# Proyecto Empresa Hidronor

# Arquitectura de datos Frontend

- React
- Typescript
- Vite
- HTML 5
- CSS 3
- Bootstrap
- Redux Toolkit

# Instalación y Configuración

### 1. Clonar el repositorio

- Inicia una ventana de terminal en Visual Studio Code o el entorno de desarrollo que prefieras.
- Clona el repositorio de GitHub utilizando este comando:

  ```bash
  git clone https://github.com/nvargas-mus/proyect-hdnr
  ```

- Confirma que la clonación fue exitosa mediante el siguiente comando:
  ```bash
  git status
  ```

### 2. Ingresar al directorio del proyecto

- Asegúrate de estar ubicado en la carpeta adecuada. De no ser así, emplea esta instrucción:

  ```bash
  cd proyecto-hdnr
  ```

### 3. Instalar las dependencias necesarias

- Desde la terminal, ejecuta el siguiente comando para descargar e instalar los paquetes requeridos:

  ```bash
  npm install
  ```

- Si durante la instalación aparece un informe de vulnerabilidades, puedes intentar resolverlas automáticamente mediante la ejecución de:
  ```bash
  npm audit fix
  ```

### 4. Añadir Bootstrap, verificador de tipos y Redux toolkit

- Para incorporar Bootstrap a tu proyecto, utiliza esta instrucción en la terminal:

  ```bash
  npm install bootstrap
  npm install bootstrap @popperjs/core
  npm install react-bootstrap-icons
  ```

- Para incluir type checker, ejecuta:

  ```bash
  npm install file-type-checker 
  ```
- Para instalar Redux toolkit, ejecuta:

  ```bash
  npm install @reduxjs/toolkit
  ```
### 5. Traer los últimos cambios

- Para asegurarte de que estás trabajando con la versión más reciente, sigue estos pasos:

#### 1. Verificar la rama actual

- Asegúrate de estar en la rama correcta utilizando el siguiente comando:

  ```bash
  git branch
  ```

- Esto mostrará una lista de las ramas existentes y marcará con un asterisco (\*) la rama en la que estás actualmente.

#### 2. Cambiar de rama (si es necesario)

- Para cambiar de rama, usa el comando:
  ```bash
  git checkout nombre-de-la-rama
  ```

#### 3. Traer los últimos cambios

- Una vez que estés en la rama correcta, utiliza el siguiente comando para traer los últimos cambios del repositorio remoto:
  ```bash
  git pull origin nombre-de-la-rama
  ```

### 6. Ejecutar el proyecto en desarrollo

- Para visualizar el proyecto en modo desarrollo, utiliza:

  ```bash
  npm run dev
  ```
### 8. Revisar el código del proyecto

- Para revisar el proyecto en busca de errores, ejecuta: 

  ```bash
  npm run lint
  ```

### 8. Compilar el proyecto para producción

- Para compilar el proyecto y preparar los archivos para producción, ejecuta:

  ```bash
  npm run build
  ```

