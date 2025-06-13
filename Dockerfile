# Usar una imagen base de Node.js para servir la aplicación
FROM node:18-alpine

# Instalar un servidor web simple
RUN npm install -g serve

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos construidos
COPY dist/ .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "3000"]

