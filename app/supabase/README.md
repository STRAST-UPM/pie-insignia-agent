# Supabase Database Structure

Este directorio contiene las migraciones de base de datos para Supabase utilizadas por la aplicación ISST AI Tutor.

## Migraciones

### `20250522092836_create_chat_logs_table.sql`

**Propósito:** Creación de la tabla principal para almacenar logs de conversaciones del chat.

**Características:**

- **Tabla `chat_logs`**: Almacena mensajes de usuarios y respuestas del asistente AI
- **Campos**:
  - `id`: UUID único (clave primaria)
  - `session_id`: Identificador de sesión de chat
  - `role`: Tipo de mensaje ('user' o 'assistant')
  - `content`: Contenido del mensaje
  - `created_at`: Timestamp de creación
- **Seguridad**:
  - Row Level Security (RLS) habilitado
  - Política de lectura para usuarios anónimos
  - Política de inserción para service role
- **Robustez**: Incluye lógica para eliminar políticas existentes antes de crearlas

## Uso en la Aplicación

### Backend (Python/FastAPI)

- **Conexión**: Configurada en `backend/app.py` usando `supabase-py`
- **Función**: `log_to_supabase()` guarda cada mensaje del chat
- **Variables de entorno requeridas**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (React/TypeScript)

- **Conexión**: Configurada en `frontend/src/supabaseClient.ts`
- **Autenticación**: Sistema completo con proveedores OAuth (Google, GitHub)
- **Variables de entorno requeridas**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Aplicación de Migraciones

Para aplicar las migraciones en un nuevo proyecto Supabase:

1. Crear un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecutar el SQL de la migración en el SQL Editor de Supabase
3. Configurar las variables de entorno correspondientes
