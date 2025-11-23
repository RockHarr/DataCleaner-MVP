# QA Checklist

Lista de verificación para pruebas manuales antes de liberar una versión.

## Carga de Archivos
- [ ] Subir un CSV válido con `;`.
- [ ] Subir un CSV válido con `,`.
- [ ] Intentar subir un archivo no CSV (ej. `.jpg`) -> Debe mostrar error o no permitirlo.

## Mapeo
- [ ] Mapear columna "RUT" y "Nombre".
- [ ] Desmarcar una columna -> Verificar que no aparece en el resultado final.
- [ ] Cambiar el nombre de una columna destino a "Otro" -> Escribir nombre personalizado.

## Limpieza
- [ ] **RUT**: Probar con RUTs duplicados -> Verificar contador de "removidas".
- [ ] **Texto**: Verificar que "  Nombre  " salga como "Nombre".
- [ ] **Regiones**: Verificar que "RM" cambie a "Metropolitana de Santiago".

## Exportación
- [ ] Exportar y abrir en Excel -> Verificar que los acentos (ñ) se vean bien (BOM correcto).
- [ ] Verificar que las columnas estén en el orden esperado.

## UI/UX
- [ ] Probar en móvil (responsive básico).
- [ ] Navegar todo el flujo usando solo el teclado (Tab / Enter).
- [ ] Verificar contraste en modo oscuro.
