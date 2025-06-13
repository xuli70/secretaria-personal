# Usar una imagen base de Node.js para servir la aplicación
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación (package.json y pnpm-lock.yaml para instalar dependencias)
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias y construir la aplicación
RUN npm install --frozen-lockfile
RUN npm run build

# Instalar un servidor web simple
RUN npm install -g serve

# Copiar los archivos construidos desde el directorio de trabajo
COPY dist/ .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "3000"]
