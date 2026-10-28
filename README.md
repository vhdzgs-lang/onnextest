# Onnex Test

Plataforma web de orientación vocacional para estudiantes de preparatoria en México. El estudiante se registra, responde 50 preguntas y solo ve una pantalla de confirmación. El servidor evalúa las respuestas, genera un reporte PDF de 7 páginas con Puppeteer y lo envía por Resend **únicamente** al administrador (`vhdzgs@gmail.com`).

**Stack:** React 19 · TypeScript · Tailwind CSS 4 · Vite · Express 5 · tRPC 11 · Drizzle ORM (MySQL/TiDB) · Puppeteer · Resend · Vitest

## Flujo

1. `/` Página de inicio con beneficios y botón **Comenzar test**.
2. `/registro` Nombre completo, edad, escuela y correo (validados en el navegador y otra vez en el servidor).
3. `/test` 50 preguntas con escala de 5 puntos, barra de progreso, botones Anterior/Siguiente y guardado temporal en `sessionStorage` (no se pierden respuestas al navegar; se borran al enviar).
4. Al enviar, el servidor (`test.submit`):
   1. guarda el test en la base de datos (si falla, se detiene y el estudiante ve un aviso para reintentar);
   2. evalúa las respuestas (perfil, personalidad, fortalezas, competencias y 3 carreras);
   3. genera el PDF (si falla, **no** se envía un correo incompleto);
   4. envía el correo al administrador y espera la respuesta de Resend.

   La respuesta indica `saved`, `pdfGenerated` y `emailSent`. El resultado de cada paso queda también en la tabla `test_submissions` (`pdf_generated`, `email_sent`, `email_id`, `delivery_error`).
5. `/listo` Mensaje de confirmación. El estudiante nunca ve resultados; no existe ningún endpoint para consultarlos.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí en producción | `mysql://usuario:contraseña@host:3306/base`. Sin ella, en desarrollo se usa memoria. |
| `DATABASE_SSL` | No | `true` para conectar con TLS. Se activa solo con hosts `tidbcloud.com`. |
| `DB_AUTO_MIGRATE` | No | `true` por defecto: aplica `drizzle/` al iniciar. |
| `RESEND_API_KEY` | Sí | Clave de Resend (`re_...`). Solo vive en el servidor. |
| `EMAIL_FROM` | Recomendada | Remitente de un **dominio verificado** en Resend, p. ej. `Onnex Test <reportes@tudominio.com>`. |
| `PUPPETEER_EXECUTABLE_PATH` | No | Ruta a Chrome/Chromium si no se usa el que descarga Puppeteer (Docker: `/usr/bin/chromium`). |
| `PORT` | No | `3000` por defecto. |
| `TRUST_PROXY` | No | Número de proxies delante del servidor (para el límite de 5 envíos cada 15 min por IP). |

Copia `.env.example` a `.env` para desarrollo. Nunca subas `.env`.

### Por qué no llegaba el correo (y cómo se evita ahora)

- **Remitente sin verificar.** Con `onboarding@resend.dev` Resend solo entrega al correo dueño de la cuenta. Para producción, verifica tu dominio en Resend y pon `EMAIL_FROM` con ese dominio. El servidor avisa en el arranque si se usa el remitente de prueba.
- **Errores ocultos.** El SDK de Resend no lanza excepciones: devuelve `{ data, error }`. `server/email.ts` revisa `error`, lo registra con `[EMAIL]` y lo propaga; el router lo registra con `[ROUTER]` y lo guarda en `delivery_error`.
- **Respuesta antes del envío.** El router hace `await` del envío antes de responder, así que el proceso no termina antes de que Resend conteste.
- **Adjunto.** El PDF se envía como `Buffer`, con nombre `.pdf` y `contentType: application/pdf`.
- Para reenviar los reportes que no llegaron: `npm run resend-pending`.

## Logs

Cada paso se registra con su etiqueta, sin claves ni tokens (los campos que parecen secretos se reemplazan por `[oculto]` y el correo del estudiante se enmascara):

```
[ROUTER] Inicio del procedimiento submitTest
[ROUTER] Datos del estudiante recibidos y validados {...}
[ROUTER] Respuestas guardadas en la base de datos {"submissionId":1}
[ROUTER] Inicio de la evaluación vocacional
[ROUTER] Inicio de generación del PDF {"filename":"Reporte-Onnex-Test-Ana-Sofia-...pdf"}
[PDF] Iniciando Puppeteer {"args":["--no-sandbox",...]}
[PDF] PDF generado correctamente {"bytes":403901,...}
[PDF] Navegador cerrado
[EMAIL] Inicio de llamada a Resend {"to":"vhdzgs@gmail.com","attachment":"...pdf","contentType":"application/pdf",...}
[EMAIL] Resend confirmó el envío {"id":"..."}
[ROUTER] submitTest completado: guardado, PDF y correo correctos
```

Los errores incluyen nombre, mensaje y stack trace completo.

## Desarrollo

```bash
npm install
cp .env.example .env      # llena DATABASE_URL y RESEND_API_KEY
npm run dev               # API en :3000 y Vite en :5173
```

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas unitarias y de integración (incluye PDF real y flujo completo en navegador móvil) |
| `npm run check` | Revisión de tipos |
| `npm run build` / `npm start` | Build de producción y arranque |
| `npm run db:generate` | Genera una migración tras cambiar `server/db/schema.ts` |
| `npm run sample-pdf` | Genera un PDF de ejemplo en `output/` |
| `npm run ads` | Regenera los artes de `marketing/artes/` |
| `npm run icons` | Regenera los iconos de la PWA desde el logo |
| `npm run resend-pending` | Reenvía los reportes con `email_sent = false` |

Las pruebas que usan Puppeteer necesitan Chrome: el que descarga `npm install`, o uno indicado en `PUPPETEER_EXECUTABLE_PATH`.

## Despliegue

Cualquier servidor con Node 22.12+ y Chromium. Con Docker:

```bash
docker build -t onnex-test .
docker run -p 3000:3000 --env-file .env onnex-test
```

La imagen instala Chromium y fuentes (Liberation, DejaVu) para que el PDF muestre bien los acentos.

## Estructura

```
client/            Frontend React (páginas, logo, PWA en client/public)
server/routers.ts  Procedimiento submitTest y preguntas (tRPC)
server/pdfGenerator.ts, server/reportTemplate.ts   PDF de 7 páginas
server/email.ts    Envío con Resend, solo al administrador
server/db/         Esquema Drizzle y almacenamiento
shared/            Preguntas, carreras, evaluación, validación y marca (compartido con una futura app móvil)
drizzle/           Migraciones SQL
marketing/         Artes 16:9, 9:16 y 1:1
tests/             Vitest
```

## Versión móvil

La web funciona como PWA: en el celular se puede "Agregar a pantalla de inicio" y abre como app (manifiesto, iconos y service worker que nunca guarda llamadas a `/api`). La lógica del test (`shared/`) y el backend (`/api/trpc`) están listos para reutilizarse desde una app de React Native con Expo.
