# Guía de Contribución

¡Gracias por querer mejorar DataCleaner!

## Setup de Desarrollo
1. Haz un fork del repositorio.
2. Instala dependencias: `npm install`.
3. Crea una rama para tu feature: `git checkout -b feature/nueva-regla`.

## Estándares de Código
- **TypeScript**: Usamos modo estricto. Evita `any` siempre que sea posible.
- **Estilos**: Bootstrap 5 para estructura, CSS custom en `global.css` para tema oscuro.
- **Componentes**: Funcionales con Hooks.

## Agregar Reglas de Limpieza
Si quieres agregar una nueva regla (ej. normalizar emails):
1. Crea la función en `src/lib/datacleaner/clean.ts`.
2. Agrega tests unitarios en `src/lib/datacleaner/__tests__/clean.test.ts`.
3. Agrega la opción en `types.ts` (`CleaningOptions`).
4. Conecta la opción en el UI (`ActionsSidebar.tsx`) y en la lógica (`App.tsx`).

## Tests
Ejecuta `npm test` antes de enviar tu PR. Asegúrate de que todos los tests pasen.

## Pull Requests
Envía tu PR describiendo qué problema soluciona y cómo probarlo.
