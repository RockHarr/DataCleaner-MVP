# Guía de Usuario

Bienvenido a DataCleaner. Sigue estos pasos para limpiar tu nómina.

## Paso 1: Cargar Datos
1. Haz clic en el botón **"Seleccionar archivo"**.
2. Elige tu archivo `.csv` o `.txt` desde tu computador.
3. La aplicación detectará automáticamente el separador (coma, punto y coma, etc.).

## Paso 2: Mapear Columnas
Verás una tabla con las columnas de tu archivo.
1. Para cada columna importante (RUT, Nombre, Región), selecciona el tipo correspondiente en el menú desplegable.
2. Si hay columnas que no necesitas en el archivo final, desmarca la casilla "Incluir".
3. Haz clic en **"Confirmar y Continuar"**.

## Paso 3: Limpiar y Exportar
Verás una vista previa de tus datos y un panel de opciones a la izquierda.

### Opciones Disponibles
- **Texto General**: Activa "Normalizar Nombres" para arreglar mayúsculas/minúsculas.
- **RUT**:
  - "Validar RUT": Verifica que los RUT sean reales.
  - "Quitar duplicados": Si un RUT aparece dos veces, borra la segunda fila.
- **Regiones**: "Normalizar nombres" corregirá "RM" a "Metropolitana de Santiago", etc.

### Revisar Resumen
En la barra superior verás cuántas filas quedaron, cuántos RUTs inválidos se encontraron y si hay regiones desconocidas.

### Exportar
1. Elige el delimitador para el nuevo archivo (Excel prefiere "Punto y coma").
2. Haz clic en **"Exportar CSV Limpio"**.
3. El archivo se descargará a tu carpeta de Descargas.

## Problemas Frecuentes
- **El archivo se ve todo en una columna**: Probablemente el delimitador no se detectó bien. Intenta guardar tu CSV usando `;` o `,` estándar.
- **Caracteres extraños (Ã±)**: Asegúrate de guardar tu CSV original con codificación **UTF-8**. DataCleaner exporta siempre en UTF-8 con BOM para máxima compatibilidad.
