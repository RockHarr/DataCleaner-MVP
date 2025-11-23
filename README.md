# DataCleaner2-MVP – RockCode

**Limpia nóminas en segundos: CSV/Excel, RUT, regiones y duplicados.**

Una herramienta web diseñada para transformar archivos CSV "sucios" en datos limpios y estandarizados, lista para usar en procesos de nómina y gestión.

## ¿Para quién es esto?
Ideal para equipos de RRHH, contabilidad y administración que pierden horas arreglando manualmente Excels con RUTs inválidos, nombres en mayúsculas/minúsculas mezcladas y regiones mal escritas.

## Características Principales (MVP)
- **Carga Flexible**: Soporta CSV con `;`, `,` o tabuladores.
- **Mapeo Inteligente**: Selecciona qué columnas importar y renómbralas fácilmente.
- **Limpieza de Texto**: Normalización de nombres (Title Case), eliminación de espacios extra y puntuación.
- **Validación de RUT**: Verifica dígito verificador, formatea con puntos y guión, y elimina duplicados.
- **Normalización de Regiones**: Estandariza nombres de regiones chilenas (ej. "RM" -> "Metropolitana de Santiago").
- **Privacidad Total**: Todo el procesamiento ocurre en tu navegador. Los datos nunca salen de tu equipo.

## Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- npm

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/rockcode/datacleaner2-mvp.git
   cd datacleaner2-mvp
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador (usualmente `http://localhost:5173`).

### Build para Producción
```bash
npm run build
```
Los archivos generados estarán en `dist/`.

## Datos de Ejemplo
En la carpeta `samples/` encontrarás `ejemplo_nomina.csv` para probar todas las funcionalidades de limpieza.

---
**Hecho con cariño por RockCode**
*Colaboración técnica con IA*
