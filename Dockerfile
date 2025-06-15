# --- ETAPA DE CONSTRUCCIÓN ---
FROM node:18-alpine AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml* ./

# Intentar instalación con frozen-lockfile, si falla usar modo normal
RUN pnpm install --frozen-lockfile || pnpm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# --- ETAPA DE EJECUCIÓN ---
FROM node:18-alpine

# Instalar serve y herramientas necesarias
RUN npm install -g serve && \
    apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Cambiar ownership al usuario no-root
RUN chown nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Copiar los archivos construidos
COPY --from=builder --chown=nextjs:nodejs /app/dist/ .

# Exponer el puerto 3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Comando para servir la aplicación
CMD ["serve", "-s", ".", "-l", "3000"]
