# Reglas de Limpieza

Este documento define formalmente las transformaciones aplicadas a los datos.

## 1. Limpieza General de Texto

### Trimming
- **Regla**: Eliminar espacios en blanco al inicio y final de la cadena.
- **Entrada**: `"  Juan Pérez  "` -> **Salida**: `"Juan Pérez"`

### Colapsar Espacios
- **Regla**: Reemplazar secuencias de múltiples espacios por un solo espacio.
- **Entrada**: `"Juan    Pérez"` -> **Salida**: `"Juan Pérez"`

### Puntuación Colgante
- **Regla**: Eliminar puntos, comas o punto y coma al final del texto.
- **Entrada**: `"Gerente."` -> **Salida**: `"Gerente"`

### Normalización de Nombres
- **Regla**: Convertir a "Title Case" (primera mayúscula, resto minúscula).
- **Entrada**: `"JOSÉ LUIS"` -> **Salida**: `"José Luis"`

## 2. RUT (Chile)

### Validación
- **Formato**: Debe contener cuerpo numérico y dígito verificador (0-9, K).
- **Algoritmo**: Módulo 11.
- **Entrada**: `"11.111.111-1"` -> **Válido**
- **Entrada**: `"11.111.111-2"` -> **Inválido**

### Formato de Salida
- **Regla**: Agregar puntos y guión.
- **Entrada**: `"123456785"` -> **Salida**: `"12.345.678-5"`

### Deduplicación
- **Criterio**: Se mantiene la **primera aparición** del RUT en el archivo.
- **Normalización para comparación**: Se comparan los RUTs sin puntos, sin guión y con K mayúscula.

## 3. Regiones

### Normalización
- **Regla**: Mapear variaciones comunes al nombre oficial de la región (SUBDERE).
- **Catálogo**:
  - "RM", "Metropolitana", "Santiago" -> "Metropolitana de Santiago"
  - "V Region", "Valpo" -> "Valparaíso"
  - (Ver `src/lib/datacleaner/regions.ts` para lista completa).
- **Caso No Reconocido**: Si no coincide con ninguna regla, se mantiene el valor original (y se contabiliza como desconocido).
