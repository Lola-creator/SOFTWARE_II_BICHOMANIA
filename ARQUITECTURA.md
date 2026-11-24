# Bichomanía — Arquitectura DDD

El proyecto está organizado por **contextos acotados** (bounded contexts). Cada contexto tiene sus propias capas y solo se comunica con otro a través de **puertos** (interfaces).

| Contexto | Qué modela | Agregados / objetos de valor |
|---|---|---|
| **identidad** | Clientes, empleados, registro, login, perfil, saldo | `Cliente`, `Empleado`, `CorreoElectronico`, `PoliticaContrasena` |
| **catalogo** | Productos y sus clasificaciones (categorías, marcas, equipos, competencias) | `Producto`, `ReglasProducto`, `Clasificacion` |
| **carrito** | Carrito activo del cliente | `Carrito`, `ItemCarrito` |
| **ubicaciones** | Países, ciudades y direcciones de envío | `Pais`, `Ciudad`, `Direccion` |
| **pedidos** | Pedido creado desde un carrito, pagos, deuda, boleta | `Pedido`, `Pago`, `Boleta` |
| **resenas** | Reseñas de productos | `Resena` |
| **encuestas** | Encuestas de empleados y votos de clientes | `Encuesta`, `OpcionEncuesta` |

## Backend (`backend/`)

```
index.js                         ← solo arranca (carga .env, contenedor, servidor)
src/
  arranque/                      ← raíz de composición: el único lugar que conoce todo
    contenedor.js                  conecta servicios ↔ repositorios según PERSISTENCIA
    persistenciaMySQL.js           adaptadores MySQL de todos los contextos
    persistenciaMemoria.js         adaptadores en memoria + datos demo
    app.js                         Express + rutas de cada contexto
  compartido/                    ← núcleo compartido
    dominio/        errores, validaciones, fechas, contratos (puertos)
    aplicacion/     ErrorPersistencia, ejecutarPersistencia
    http/           responderCasoDeUso (error de dominio → código HTTP)
    infraestructura/mysql | memoria
  contextos/<contexto>/
    dominio/          entidades, objetos de valor, reglas y PUERTOS (Repositorio…)
    aplicacion/       casos de uso (<Contexto>Service)
    infraestructura/  adaptadores: mysql/, memoria/, bcrypt, pdfkit, disco…
    http/             rutas Express (solo traducen HTTP ⇄ caso de uso)
test/<contexto>/      pruebas por contexto
```

**Regla de dependencias:** `http → aplicacion → dominio ← infraestructura`. El dominio no importa nada de Express, MySQL ni bcrypt.

**Errores de dominio → HTTP** (en `compartido/http/responderCasoDeUso.js`):
`ErrorValidacion` 400 · `ErrorCredenciales` 401 · `ErrorNoAutorizado` 403 · `ErrorNoEncontrado` 404 · resto 500.

**Comunicación entre contextos** (sin tocar tablas ajenas desde el dominio):
- Pedidos → Carrito: puerto `GestorCarritos` (cierra el carrito y abre uno nuevo).
- Pedidos → Identidad: puerto `MonederoClientes`, implementado con `IdentidadService.abonarSaldo`.

### La base de datos todavía no está decidida

Cada contexto define **qué necesita** guardar como un puerto en `dominio/` (p. ej. `RepositorioPedidos`). Hoy hay dos implementaciones:

| `PERSISTENCIA` | Qué usa | Para qué |
|---|---|---|
| `memoria` | `infraestructura/memoria/*` | Desarrollar y probar sin BD. Trae datos demo. Se borra al reiniciar. |
| `mysql` (por defecto) | `infraestructura/mysql/*` | Tus tablas actuales (mismas consultas que antes). |

Cuando definas la base de datos (otra estructura MySQL, PostgreSQL, Supabase…), solo escribes nuevos adaptadores que implementen esos puertos y los registras en `arranque/`. El dominio, los casos de uso, las rutas y el frontend no cambian.

Usuarios demo en modo memoria: empleado `admin@bichomania.com` / `Admin1234`, cliente `cliente@gmail.com` / `Cliente123`.

### Cómo correr

```bash
cd backend
npm install
npm run start:memoria   # sin base de datos
npm run start:local     # MySQL con .env.local (igual que antes)
npm test                # pruebas con jest
```

Todos los endpoints conservan la misma URL y el mismo formato de respuesta, así que el frontend y las pruebas Selenium/Maven siguen funcionando.

## Frontend (`frontend/src/`)

```
index.js
app/                    App.js (rutas), layout (header/footer), paginas/home, rutas (guards)
compartido/infraestructura/
  clienteHttp.js          único lugar con la URL del backend; lanza ErrorApi con el mensaje del servidor
  sesion.js               lectura/escritura de la sesión (localStorage)
  supabaseClient.js
modulos/<contexto>/
  dominio/                reglas puras (validarRegistro, urlImagenProducto, límites de producto)
  infraestructura/        <contexto>Api.js — todas las llamadas HTTP del contexto
  ui/                     componentes React (sin fetch directo)
```

Ningún componente hace `fetch` ni toca `localStorage` directamente.

## Cambios de comportamiento (correcciones)

- **Pedido.js** leía `id_usuario` al cargar el módulo: si iniciabas sesión después, quedaba vacío. Ahora se lee al montar.
- **Detalles.js** "Agregar al carrito" hacía `POST /producto/:id` (no existe). Ahora usa `/carrito/agregar`.
- **Deudas → pagar**: calculaba el máximo con el total del carrito, sin restar pagos previos. Ahora usa la deuda real del pedido.
- **Deuda.js** usaba `http://localhost:3001` fijo; ahora usa `REACT_APP_API_URL`. Eliminar una compra ahora recarga también la lista de compras.
- **Boleta**: el JOIN de equipos comparaba `id_equipo` con `id_competencia`; ahora usa `equipos_productos`.
- **Pedido nuevo**: el estado lo decide el dominio (nace pendiente, pasa a pagado cuando la deuda es 0); se ignora el `id_estado` del cliente.
- **Registro**: el backend valida también DNI (8 dígitos), teléfono (9), contraseña (8–12 con mayúscula) y correo duplicado (400 en vez de error SQL 500).
- **Reseñas**: puntuación 1–5 obligatoria; reseña inexistente → 404, reseña ajena → 403.
- Fechas de reseñas, pagos y pedidos en hora local (antes UTC: después de las 7 p. m. en Lima salía el día siguiente).
- Imágenes de producto resueltas en un solo lugar (`urlImagenProducto`): `/uploads/...` desde el backend, otras rutas desde Supabase.
