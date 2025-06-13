# Secretaria Personal - Web App

Una aplicación web móvil que funciona como secretaria personal, integrándose con n8n para procesamiento de mensajes.

## Características

- ✅ Interfaz de chat minimalista y agradable
- ✅ Panel de administración para configurar n8n
- ✅ Almacenamiento seguro de credenciales en el dispositivo
- ✅ Diseño responsivo optimizado para móviles
- ✅ Integración completa con n8n via webhooks

## Instalación en Coolify (Hostinger)

### Paso 1: Preparar el repositorio

1. Sube todos los archivos de este proyecto a un repositorio Git (GitHub, GitLab, etc.)
2. Asegúrate de que el `Dockerfile` esté en la raíz del proyecto

### Paso 2: Configurar en Coolify

1. **Accede a tu panel de Coolify**
2. **Crear nueva aplicación:**
   - Haz clic en "New Resource" → "Application"
   - Selecciona "Public Repository" o "Private Repository" según tu caso
   - Introduce la URL de tu repositorio Git

3. **Configuración de la aplicación:**
   - **Name:** `secretaria-personal`
   - **Build Pack:** Docker
   - **Port:** `3000`
   - **Domain:** Configura tu dominio o subdominio (ej: `secretaria.tudominio.com`)

4. **Variables de entorno (opcional):**
   - No son necesarias para esta aplicación ya que la configuración se hace desde el panel de administración

### Paso 3: Desplegar

1. Haz clic en "Deploy"
2. Coolify construirá automáticamente la aplicación usando el Dockerfile
3. Una vez completado, la aplicación estará disponible en tu dominio configurado

### Paso 4: Configurar n8n

1. Accede a la aplicación desde tu móvil
2. Ve a la pestaña "Admin"
3. Configura:
   - **Endpoint Principal:** URL de tu webhook de n8n
   - **API Key:** Si tu n8n requiere autenticación
   - **Headers personalizados:** Si necesitas headers específicos

## Estructura del proyecto

```
personal-secretary-app/
├── dist/                 # Archivos construidos para producción
├── src/                  # Código fuente
├── Dockerfile           # Configuración para Docker/Coolify
├── package.json         # Dependencias del proyecto
└── README.md           # Este archivo
```

## Uso

1. **Chat:** Envía mensajes que serán procesados por tu workflow de n8n
2. **Admin:** Configura las credenciales y endpoints de n8n

## Soporte

La aplicación está optimizada para:
- ✅ Android (prioridad)
- ✅ iOS (prioridad)
- ✅ Windows (secundario)

## Tecnologías utilizadas

- React 18
- Tailwind CSS
- shadcn/ui
- Vite
- Docker

