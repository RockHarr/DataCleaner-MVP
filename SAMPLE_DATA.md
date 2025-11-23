# Datos de Ejemplo

El archivo `samples/ejemplo_nomina.csv` está diseñado para probar los casos borde de DataCleaner.

## Contenido

| RUT | Nombre | Región | Notas |
|-----|--------|--------|-------|
| `11.111.111-1` | `JUAN PEREZ` | `RM` | Caso estándar, nombre mayúsculas, región abreviada. |
| `11111111-1` | `juan perez` | `Metropolitana` | **Duplicado** del anterior (mismo RUT limpio). Nombre minúsculas. |
| `22.222.222-K` | `Maria  Soto.` | `V Region` | RUT con K. Nombre con doble espacio y punto final. Región variante. |
| `123` | `Pedro Error` | `Texas` | **RUT Inválido** (muy corto). Región desconocida. |
| (vacío) | `Sin Rut` | (vacío) | Fila sin RUT y sin región. |

## Resultados Esperados

Al procesar este archivo con las opciones por defecto:
1. **Filas**: Deberían quedar 4 filas (se elimina el duplicado de Juan Perez).
2. **RUTs**: Se detectará 1 inválido (`123`).
3. **Regiones**: `RM` y `V Region` se normalizarán. `Texas` quedará como desconocida.
4. **Nombres**: `JUAN PEREZ` -> `Juan Perez`. `Maria Soto.` -> `Maria Soto`.
