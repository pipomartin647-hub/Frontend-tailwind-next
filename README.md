# tailwind-next-starter

Frontend boilerplate listo para producción con **Next.js 16 · TailAdmin v2 · Tailwind CSS v4 · TypeScript**.

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16 | Framework React (App Router) |
| TailAdmin | 2 | UI Kit de dashboards |
| Tailwind CSS | 4 | Estilos |
| TypeScript | 5.9 | Tipado estático |
| pnpm | 10+ | Package manager |

---

## Inicio rápido (desarrollo)

### 1. Requisitos previos

- Node.js v24+
- pnpm v10+
- El backend (`nest-api-starter`) corriendo en `http://localhost:3001`

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> Cambia la URL si tu backend corre en otro host o puerto.

### 4. Levantar el servidor de desarrollo

```bash
pnpm dev
```

Frontend disponible en **http://localhost:3000**

---

## Conectar con el backend

El cliente HTTP vive en `src/services/api.ts` y ya está configurado para:

- Leer la base URL desde `NEXT_PUBLIC_API_URL`
- Adjuntar el JWT (`localStorage.getItem('token')`) en cada request autenticado
- Redirigir a `/signin` automáticamente si el servidor devuelve **401**
- Envolver todas las respuestas con manejo de errores tipado (`ApiError`)

Para cambiar la URL del backend en producción, solo modifica `NEXT_PUBLIC_API_URL` al hacer el build.

---

## Páginas disponibles

| Ruta | Descripción | Auth |
|---|---|---|
| `/signin` | Iniciar sesión | No |
| `/signup` | Crear cuenta | No |
| `/` | Dashboard principal | Sí |
| `/profile` | Perfil del usuario | Sí |
| `/contacts` | Tabla de contactos (real API) | Sí |
| `/users` | Tabla de usuarios (real API) | Sí |

Las rutas protegidas redirigen a `/signin` si no hay token válido (gestionado por `src/middleware.ts`).

---

## Autenticación

El flujo de auth usa cookies + localStorage:

1. `/signin` y `/signup` llaman al backend y guardan el token en `localStorage` y una cookie `token` (para el middleware de Next.js).
2. El middleware en `src/middleware.ts` lee la cookie y redirige si no hay sesión.
3. `useAuth` hook expone `token` y `logout()` en cualquier componente.
4. `useMe` hook llama a `GET /auth/me` y devuelve los datos del usuario actual.

Para cerrar sesión:

```ts
const { logout } = useAuth();
logout(); // limpia localStorage, cookie y redirige a /signin
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3001` |

---

## Comandos útiles

```bash
pnpm dev          # Servidor de desarrollo con hot reload
pnpm build        # Build de producción (output: standalone)
pnpm start        # Correr el build de producción
pnpm lint         # ESLint
```

---

## Estructura relevante

```
src/
 app/
    (admin)/           # Páginas del dashboard (protegidas)
       (others-pages)/
           contacts/  # /contacts  ContactsTable
           users/     # /users  UsersTable
           profile/   # /profile  ProfileConnected
    (full-width-pages)/
        signin/
        signup/
 components/
    auth/              # SignInForm, SignUpForm (conectados al backend)
    contacts/          # ContactsTable
    users/             # UsersTable
 hooks/
    useAuth.ts         # Token y logout
    useMe.ts           # GET /auth/me
 services/
    api.ts             # Cliente HTTP base
    auth.service.ts    # register, login, logout
    contacts.service.ts
 types/
     api.types.ts       # Todos los tipos compartidos
```

---

## Licencia

MIT — Libre para uso personal y comercial.
