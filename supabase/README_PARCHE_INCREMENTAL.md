# Guía de Aplicación: Parche Incremental Seguro para Supabase

> [!IMPORTANT]
> **No es necesario borrar ni reiniciar tu base de datos.**
> Este parche aplica únicamente las nuevas tablas de Remesas/Regalos, refuerza las políticas de seguridad RLS por roles (`client`, `traveler`, `merchant`, `admin`), asegura el trigger de creación de usuarios y activa la suscripción Realtime.

---

## Instrucciones Paso a Paso

1. Inicia sesión en tu panel de [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto: **`ftatticgysvkqltkcnqt`**.
3. En el menú de la izquierda, haz clic en **SQL Editor**.
4. Crea una nueva consulta (**New Query**).
5. Abre el archivo:
   [`supabase/migrations/20260909_incremental_patch.sql`](file:///d:/ProyectosCode/BlockChain/supabase/migrations/20260909_incremental_patch.sql)
6. Copia todo su contenido, pégalo en el editor SQL de Supabase y presiona **Run** (o `Ctrl + Enter`).
7. Verás el mensaje **`Success. No rows returned`**.

---

## ¿Qué añade este parche?

| Componente | Descripción |
| :--- | :--- |
| **`remittances_and_gifts`** | Tabla para Remesas P2P y Pagos Programados (Navidad, Cumpleaños, Mesadas) con Smart Contract TimeLock y retiro con OTP. |
| **Row Level Security (RLS)** | Políticas estrictas por rol: cada cliente, viajero, comerciante y administrador accede únicamente a lo que le corresponde. |
| **`handle_new_user()` seguro** | Corrige el `search_path = public` y maneja excepciones para evitar errores 500 al registrarse con correo/contraseña o Google. |
| **Supabase Realtime** | Agrega `orders` y `remittances_and_gifts` al canal de publicación en tiempo real para actualización instantánea sin recargar la pantalla. |
| **Datos de Ejemplo** | Inserta una remesa programada de Navidad con Smart Contract, un regalo de cumpleaños y una remesa directa completada. |
