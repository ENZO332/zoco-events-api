# Zoco Events API

API REST para gestión de bares y eventos de Tucumán con automatización, deduplicación y procesamiento con IA.

## Stack

- **Node.js + Express 4**
- **MongoDB + Mongoose**
- **Groq (LLaMA 3.1)** para detección de duplicados semánticos, normalización de direcciones y agente conversacional


## Arquitectura

El proyecto sigue una arquitectura en capas:

routes → controllers → application → infrastructure → MongoDB

- **routes**: define los endpoints
- **controllers**: maneja requests y responses HTTP
- **application**: lógica de negocio y coordinación con IA
- **infrastructure**: acceso a datos con Mongoose
- **models**: esquemas de Mongoose que definen la estructura de los documentos en MongoDB

## Instalación

```bash
git clone https://github.com/ENZO332/zoco-events-api.git
cd zoco-events-api
npm install
```

Crear un archivo `.env` en la raíz:

```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

Iniciar el servidor:

```bash
npm run dev
```

## Deploy

La API está deployada en Railway:
https://zoco-events-api-production.up.railway.app

## Dashboard

El dashboard frontend está disponible en:

https://zoco-events-frontend.vercel.app

Permite gestionar bares y eventos mediante una interfaz desarrollada en React. Incluye funcionalidades de listado, creación, edición y desactivación lógica de registros, además de consultas al agente IA utilizando lenguaje natural.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /events | Listar eventos activos |
| GET | /events/:id | Obtener evento por ID |
| POST | /events | Crear evento |
| PUT | /events/:id | Editar evento |
| DELETE | /events/:id | Desactivar evento (soft delete) |
| POST | /events/ask | Consultar al agente IA |

## Automatización

El script `src/scripts/loadBares.js` carga automáticamente el dataset mock de bares de Tucumán:

```bash
node src/scripts/loadBares.js
```

El script:
- Evita duplicados exactos (case-insensitive)
- Detecta duplicados semánticos con IA (ej: "Bar Irlanda" y "Irlanda Bar")
- Registra cada operación con timestamp en consola

## Uso de IA

Se utiliza **Groq (LLaMA 3.1-8b-instant)** en tres funciones:

- **Detección de duplicados semánticos**: al crear un evento, la IA compara el nuevo registro contra los nombres existentes para detectar equivalencias semánticas.
- **Normalización de direcciones**: las direcciones se normalizan automáticamente antes de guardarse.
- **Agente conversacional**: el endpoint `POST /events/ask` recibe una pregunta en lenguaje natural y responde usando los datos reales almacenados en la base. Ejemplo: `"¿Qué bares hay en Yerba Buena?"`

Las funciones de deduplicación y normalización se aplican tanto en la carga automática como en la creación manual vía API.

## Ejemplo de consulta al agente IA

```http
POST https://zoco-events-api-production.up.railway.app/events/ask
```

Body:

```json
{
  "question": "¿Qué bares hay en Yerba Buena?"
}
```

## Manejo de errores
La API usa un middleware global de errores con una clase `AppError` personalizada que centraliza el formato de respuesta y el status HTTP en toda la aplicación.

## Decisiones técnicas

**¿Cómo evitás duplicados?**
Doble chequeo: primero exacto (case-insensitive, sin query extra a Mongo), luego semántico con IA.

**¿Cómo escalarías este sistema?**
- Reemplazar el script por un cron job o worker queue (Bull/BullMQ)
- Agregar índices en MongoDB para búsquedas por nombre y categoría
- Incorporar paginación y filtros en los endpoints del CRUD para manejar mayores volúmenes de datos.
- Cachear datos frecuentes para reducir consultas repetidas a la base de datos.
- Desacoplar el servicio de IA mediante una interfaz/adaptador para poder cambiar fácilmente entre distintos proveedores como Groq u OpenAI.

**¿Qué problemas puede tener este flujo?**
- La IA puede tener falsos positivos en la detección semántica
- Si la base crece mucho, mandar todos los nombres al prompt de IA se vuelve ineficiente
- El script no tiene reintentos si falla a mitad de carga

**¿Cómo mejorarías la calidad de los datos?**
- Validación de esquema en la entrada (Joi o Zod)
- Sistema de aprobación manual antes de persistir