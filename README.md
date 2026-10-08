# Banco de alimentos

Aplicación local para administrar inventario, donaciones, beneficiarios,
entregas y solicitudes entre sucursales. En modo local los datos de ejemplo y
los cambios se guardan en el almacenamiento del navegador; no hace falta
instalar ni ejecutar un backend.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Ejecutar en local

```sh
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`). La
aplicación selecciona automáticamente el modo local cuando no se configura
`VITE_API_URL`. Incluye datos de muestra para las cuatro sucursales y conserva
los cambios al recargar la página.

Puedes elegir la sucursal creando un archivo `.env.local` en la raíz del
proyecto:

```dotenv
VITE_CURRENT_NODE=comondu
VITE_LOCAL_MODE=true
```

Los valores válidos para `VITE_CURRENT_NODE` son `comondu`, `lapaz`, `loreto`
y `mulege`. Para borrar los datos locales, elimina el almacenamiento del sitio
desde las herramientas de desarrollo del navegador.

## Conectar un backend

Para desactivar el modo local, configura en `.env.local` la URL de una API
compatible y la sucursal:

```dotenv
VITE_LOCAL_MODE=false
VITE_API_URL=http://localhost:3001
VITE_CURRENT_NODE=comondu
```

Reinicia Vite después de cambiar variables de entorno. Las operaciones entre
sucursales en modo backend requieren que la API correspondiente sea accesible
desde el navegador.

## Comandos

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la versión de producción en `dist/`.
- `npm run preview`: sirve localmente la compilación de producción.
- `npm run lint`: ejecuta ESLint.
