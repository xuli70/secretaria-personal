# --- ETAPA DE CONSTRUCCIÓN ---
FROM node:18-alpine AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias usando pnpm (sin frozen-lockfile para CI)
RUN pnpm install --no-frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación usando pnpm
RUN pnpm run build

# --- ETAPA DE EJECUCIÓN ---
FROM node:18-alpine

# Instalar serve y curl para healthcheck
RUN npm install -g serve && apk add --no-cache curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos construidos desde la etapa 'builder'
COPY --from=builder /app/dist/ .

# Exponer el puerto 3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "3000"]
