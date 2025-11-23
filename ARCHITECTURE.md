# Arquitectura del Proyecto

DataCleaner2-MVP es una aplicación Single Page Application (SPA) construida con React y TypeScript, enfocada en el procesamiento de datos en el cliente (browser-side).

## Estructura de Carpetas

```
/
├── public/              # Assets estáticos
├── samples/             # Datos de prueba
├── src/
│   ├── components/      # Componentes React de UI (Presentacionales y Contenedores)
│   ├── lib/
│   │   └── datacleaner/ # Lógica de negocio pura (Core Domain)
│   │       ├── clean.ts    # Reglas de texto
│   │       ├── rut.ts      # Validación RUT
│   │       ├── regions.ts  # Catálogo regiones
│   │       ├── parse.ts    # Wrapper PapaParse
│   │       └── types.ts    # Definiciones de tipos
│   ├── styles/          # CSS global y overrides
│   ├── App.tsx          # Orquestador principal (State Management)
│   └── main.tsx         # Punto de entrada
└── ...config files
```

## Flujo de Datos

1. **Carga (UploadPanel)**: 
   - El usuario selecciona un archivo.
   - `parse.ts` usa PapaParse para convertir CSV a JSON (`RawRow[]`).
   - Se detectan metadatos (delimitador, columnas).

2. **Mapeo (MappingTable)**:
   - El usuario asocia columnas del CSV original a columnas canónicas del sistema ("RUT", "Nombre", etc.).
   - Se define qué columnas se incluyen en la salida.

3. **Configuración (ActionsSidebar)**:
   - El usuario selecciona reglas de limpieza (Trim, RUT dedupe, Normalización Región).
   - Estado gestionado en `App.tsx`.

4. **Procesamiento (App.tsx -> lib/datacleaner)**:
   - Al cambiar opciones o confirmar, se ejecuta el pipeline de limpieza:
     1. `cleanText`: Limpieza básica por celda.
     2. `normalizeName`: Si aplica a la columna.
     3. `processRuts`: Validación y deduplicación global.
     4. `processRegions`: Normalización contra catálogo.
   - Se calculan estadísticas (`SummaryStats`).

5. **Exportación**:
   - Se genera un nuevo CSV con las filas procesadas.
   - Se usa `FileSaver` para descargar el archivo.

## Decisiones Técnicas
- **Lógica separada de UI**: Toda la lógica compleja de limpieza está en `src/lib/datacleaner` y es testeable independientemente de React.
- **Procesamiento Síncrono**: Para el MVP, procesamos todo en el hilo principal. Para archivos muy grandes (>100k filas), se consideraría usar Web Workers en el futuro.
