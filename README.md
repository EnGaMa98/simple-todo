# Simple Todo

Aplicacion de tareas construida con React y Vite. La interfaz se ha replanteado con un enfoque mas minimalista y ahora incluye prioridad por tarea, busqueda en tiempo real y una vista de foco para destacar la siguiente accion importante.

## Funcionalidades

- Crear, editar, completar y eliminar tareas
- Prioridad por tarea: alta, media y baja
- Busqueda instantanea por titulo
- Filtros por estado: todas, activas y completadas
- Tarjeta de "Siguiente foco" basada en prioridad y actividad reciente
- Persistencia local con `localStorage`
- Interfaz responsive para escritorio y movil

## Stack

- React 19
- Vite
- CSS modular por componentes

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Estructura

```text
src/
  components/
  constants/
  utils/
  App.jsx
  App.css
  index.css
  main.jsx
```
