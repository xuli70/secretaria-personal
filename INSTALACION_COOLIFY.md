# Instrucciones de Instalación en Coolify (Hostinger)

## Archivos necesarios

Necesitarás subir estos archivos a un repositorio Git:

1. **Toda la carpeta `dist/`** - Contiene la aplicación construida
2. **Dockerfile** - Configuración para Coolify
3. **package.json** - Información del proyecto
4. **README.md** - Documentación

## Pasos detallados

### 1. Crear repositorio Git

```bash
# En tu computadora local, crea un nuevo repositorio
git init secretaria-personal
cd secretaria-personal

# Copia todos los archivos del proyecto aquí
# Luego:
git add .
git commit -m "Initial commit - Secretaria Personal App"
git remote add origin https://github.com/tu-usuario/secretaria-personal.git
git push -u origin main
```

### 2. Configurar en Coolify

1. **Acceder a Coolify:**
   - Ve a tu panel de Coolify en Hostinger
   - Haz clic en "New Resource" → "Application"

2. **Configuración del repositorio:**
   - **Source:** Public Repository (o Private si es privado)
   - **Repository URL:** `https://github.com/tu-usuario/secretaria-personal.git`
   - **Branch:** `main`

3. **Configuración de la aplicación:**
   - **Name:** `secretaria-personal`
   - **Build Pack:** Docker
   - **Port:** `3000`
   - **Domain:** Tu dominio (ej: `secretaria.tudominio.com`)

4. **Configuración avanzada:**
   - **Health Check Path:** `/` (opcional)
   - **Restart Policy:** `unless-stopped`

### 3. Desplegar

1. Haz clic en "Deploy"
2. Coolify detectará automáticamente el Dockerfile
3. El proceso de construcción tomará unos minutos
4. Una vez completado, verás el estado "Running"

### 4. Verificar instalación

1. Accede a tu dominio desde el navegador
2. Deberías ver la aplicación "Secretaria Personal"
3. Prueba cambiar entre las pestañas "Chat" y "Admin"

### 5. Configurar desde tu móvil

1. Abre la aplicación en tu móvil
2. Ve a la pestaña "Admin"
3. Configura:
   - **Endpoint Principal:** `https://tu-n8n.tudominio.com/webhook/tu-webhook-id`
   - **API Key:** Tu token de n8n (si aplica)
   - **Headers personalizados:** Si necesitas headers específicos

## Solución de problemas

### Si el despliegue falla:

1. **Verificar logs en Coolify:**
   - Ve a la sección "Logs" de tu aplicación
   - Busca errores en el proceso de construcción

2. **Verificar Dockerfile:**
   - Asegúrate de que el Dockerfile esté en la raíz del repositorio
   - Verifica que la carpeta `dist/` exista y tenga contenido

3. **Verificar puerto:**
   - La aplicación debe ejecutarse en el puerto 3000
   - Coolify debe estar configurado para exponer el puerto 3000

### Si la aplicación no carga:

1. **Verificar dominio:**
   - Asegúrate de que el dominio esté correctamente configurado
   - Verifica que el DNS apunte a tu servidor de Hostinger

2. **Verificar SSL:**
   - Coolify debería configurar SSL automáticamente
   - Si hay problemas, verifica la configuración de SSL en Coolify

## Actualizaciones futuras

Para actualizar la aplicación:

1. Haz cambios en tu repositorio Git
2. Haz push de los cambios
3. En Coolify, haz clic en "Deploy" nuevamente
4. La aplicación se actualizará automáticamente

## Configuración de n8n

Ejemplo de configuración en el panel Admin:

```
Endpoint Principal: https://tu-n8n.tudominio.com/webhook/secretaria
Endpoint de Prueba: https://tu-n8n.tudominio.com/webhook/test
API Key: (si tu n8n requiere autenticación)
Headers Personalizados: {"Content-Type": "application/json"}
Datos Adicionales: {"source": "mobile-app", "userId": "tu-id"}
```

