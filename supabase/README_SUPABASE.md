# 🚀 Guía de Despliegue de Base de Datos — AYNI Protocol (Supabase)

Esta carpeta contiene los scripts SQL completos y optimizados para **Supabase (PostgreSQL 15+)** listos para producción.

---

## 📁 Archivos Incluidos

1. **`production_schema.sql`**: Esquema DDL maestro.
   - Tipos enumerados (`user_role`, `order_status`, `trip_status`, `heritage_status`).
   - Tablas: `profiles`, `stores`, `products`, `trips`, `orders`, `heritage_vaults`, `heritage_beneficiaries`, `ai_receipt_audits`.
   - Triggers automáticos para vincular `auth.users` con `public.profiles`.
   - Políticas de seguridad por fila (**Row Level Security - RLS**).
   - Creación de buckets en Supabase Storage (`products`, `receipts`, `avatars`, `heritage-docs`).

2. **`production_seed.sql`**: Datos de prueba completos y usuarios para todos los roles.
   - 4 usuarios preconfigurados en `auth.users` y `public.profiles` con contraseñas encriptadas con bcrypt (`pgcrypto`).
   - Tiendas de condimentos, artesanías y farmacia/medtech.
   - Catálogo de **Condimentos & Sabores de la Diáspora** (ají amarillo, llajwa, sales ancestrales).
   - Rutas activas intercontinentales (Madrid, Buenos Aires, Miami).
   - Bóveda de Herencia Cripto (**AYNI Heritage**) con 3 beneficiarios asignados y regla de Dead Man's Switch.

---

## ⚡ Instrucciones de Instalación en Supabase

### Paso 1: Abrir el SQL Editor
1. Ingresa a tu panel en [supabase.com](https://supabase.com) y selecciona tu proyecto.
2. En la barra lateral izquierda, haz clic en el ícono de **SQL Editor** (`>_`).

### Paso 2: Ejecutar el Esquema (`production_schema.sql`)
1. Crea una nueva consulta (**New query**).
2. Copia y pega el contenido completo de [`production_schema.sql`](file:///d:/ProyectosCode/BlockChain/supabase/production_schema.sql).
3. Haz clic en el botón verde **Run** (Ejecutar).
4. Verifica que aparezca el mensaje: *Success. No rows returned*.

### Paso 3: Ejecutar los Datos de Prueba (`production_seed.sql`)
1. Abre otra pestaña en el **SQL Editor**.
2. Copia y pega el contenido de [`production_seed.sql`](file:///d:/ProyectosCode/BlockChain/supabase/production_seed.sql).
3. Haz clic en **Run**.
4. ¡Listo! Se habrán creado los 4 usuarios de prueba, productos, tiendas y rutas.

---

## 🔑 Credenciales de Prueba (Todos los Roles)

Todos los usuarios tienen la misma contraseña maestra para facilitar tus pruebas:  
👉 **`Password123!`**

| Rol | Correo Electrónico | Nombre de Perfil | Funciones que puedes probar |
| :--- | :--- | :--- | :--- |
| **Cliente / Comprador** | `cliente@ayni.app` | Ana María Quispe | Encargar compras a pie, ver condimentos de la diáspora, gestionar Bóvedas de Herencia AYNI Heritage |
| **Viajero / Transportista** | `viajero@ayni.app` | Alejandro Mamani | Publicar vuelos e itinerarios, aceptar encargos de maleta, validar entrega con OTP |
| **Comercio / Artesano** | `comercio@ayni.app` | Demetrio Flores (Sabores del Valle) | Gestionar catálogo de productos, publicar condimentos y artesanías, ver órdenes |
| **Administrador / Auditor** | `admin@ayni.app` | Auditor Oficial AYNI | Ver reportes de IA multimodal, auditar facturas aduaneras y transacciones en Escrow |

---

## ⚙️ Configuración del Entorno Local (`.env.local`)

Una vez que tengas tu proyecto de Supabase creado, copia tus credenciales desde **Project Settings -> API** y colócalas en tu archivo `.env.local` en la raíz del proyecto:

```env
# URL de tu proyecto de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Llave Pública Anónima (Anon Public Key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Llave de Servicio (Solo para funciones backend / Server Components)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
