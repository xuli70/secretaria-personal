# --- ETAPA DE CONSTRUCCIÓN ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y pnpm-lock.yaml para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN npm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# --- ETAPA DE EJECUCIÓN ---
FROM node:18-alpine

# Instalar un servidor web simple
RUN npm install -g serve

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos construidos desde la etapa 'builder'
COPY --from=builder /app/dist/ .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "3000"]
