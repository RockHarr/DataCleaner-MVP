# Accesibilidad (A11y)

DataCleaner se esfuerza por cumplir con **WCAG 2.1 Nivel AA**.

## Decisiones de Diseño
- **Contraste**: El tema oscuro utiliza un fondo `#020617` con texto `#e5e7eb`, garantizando un ratio de contraste suficiente para lectura prolongada.
- **Color de Acento**: El azul `#38bdf8` se usa para acciones principales y estados de foco, con suficiente luminosidad contra el fondo oscuro.

## Navegación
- **Teclado**: Toda la interfaz es navegable vía `Tab`.
- **Foco Visible**: Se ha implementado un anillo de foco (`outline`) personalizado y visible en todos los elementos interactivos.
- **Formularios**: Todos los inputs tienen etiquetas (`label`) asociadas explícita o implícitamente.

## Semántica
- Uso correcto de hitos HTML5 (`header`, `main`, `footer`, `nav`).
- Tablas de datos con `th scope="col"`.
- Mensajes de estado (alertas) con roles apropiados.

## Checklist de Cumplimiento
- [x] Contraste de texto > 4.5:1.
- [x] Sin trampas de teclado.
- [x] Feedback visual al hacer hover/focus.
- [x] Estructura de encabezados lógica (h1, h2, h3).
