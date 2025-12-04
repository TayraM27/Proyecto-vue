# primerProyecto — Juego: Cuida a tu gato 🐱

Un juego interactivo de cuidados virtuales hecho con **Vue 3**, **Vue Router** y **Vite**. 

Proyecto educativo para estudiantes de **DAW 2º curso** con comentarios en español explicando la lógica.

---

## 🎮 Características

- **Dos páginas**: Inicio (menú) y Juego (gameplay)
- **Estadísticas del gato**: Hambre, Felicidad, Limpieza y Energía
- **Sistema de niveles**: Sube de nivel cada 500 segundos de juego
- **Acciones interactivas**: Comer, Jugar, Limpiar, Dormir, Acariciar
- **Persistencia**: Guarda automáticamente en `localStorage`
- **Efectos visuales**: Animaciones CSS, cambios de estados y feedback visual
- **Responsive**: Funciona en desktop y móvil

---

## 📁 Estructura del proyecto

```
src/
├── App.vue                 # Componente raíz (router-view)
├── main.js                 # Punto de entrada + configuración de Router
├── router.js               # Definición de rutas
├── components/
│   └── CatGame.vue         # Componente antiguo (opcional, no usado)
└── views/
    ├── Home.vue            # Página de inicio (menú y instrucciones)
    └── Game.vue            # Página del juego (gameplay)
```

---

## ⚙️ Requisitos

- **Node.js** 20.x o superior
- **npm** (viene con Node)
- VS Code (recomendado)

---

## 🚀 Instalación y ejecución

### 1. Instalar dependencias

```powershell
cd 'c:\Users\tayra\Desktop\vue\primerProyecto'
npm install
```

### 2. Ejecutar en modo desarrollo

```powershell
npm run dev
```

Abre en tu navegador la URL que muestre (normalmente `http://localhost:5173`).

### 3. Build para producción

```powershell
npm run build
```

Genera carpeta `dist/` lista para desplegar.

---

## 🎯 Cómo jugar

### Página de inicio (Home.vue)
- **Nuevo Juego**: comienza un juego limpio
- **Continuar**: carga tu juego guardado
- **Borrar guardado**: elimina el estado actual
- Información sobre cómo jugar y consejos

### Página del juego (Game.vue)
- **Hambre (🍖)**: dale de comer cuando baje. Comer lo ensucia un poco.
- **Felicidad (😊)**: juega con él para mantenerlo feliz. Jugar consume energía.
- **Limpieza (✨)**: límpialo cuando esté sucio. ¡Le encanta estar limpio!
- **Energía (⚡)**: déjalo dormir cuando esté cansado. Dormir consume hambre.
- **Acariciar (💕)**: sin costo, solo le da un pequeño boost de felicidad.

**Nota**: Si alguna barra llega a 0, el juego termina. ¡Mantén el balance!

---

## 📚 Para estudiantes DAW 2º

### Conceptos clave estudiados

1. **Vue 3 Composition API** (`ref`, `reactive`, `computed`, `watch`)
2. **Vue Router** (creación de rutas, navegación)
3. **Ciclo de vida** (`onMounted`, `onUnmounted`)
4. **State management** (estado reactivo compartido)
5. **LocalStorage** (persistencia de datos)
6. **CSS Grid y Flexbox** (layouts responsive)
7. **Animaciones CSS** (@keyframes)
8. **Binding dinámico** (`:class`, `:style`, `@click`)

### Ejercicios sugeridos

- Modifica los valores en `tick()` para cambiar la dificultad
- Añade más acciones (ej: "Jugar afuera", "Dar medicina")
- Implementa un sistema de "puntos" o "logros"
- Crea un historial de cambios de nivel
- Añade sonidos usando Web Audio API
- Personaliza los emojis con imágenes SVG propias

### Archivos con comentarios detallados

- `src/views/Game.vue` - Lógica principal del juego
- `src/views/Home.vue` - Página de inicio
- `src/router.js` - Configuración de rutas

---

## 🛠️ Troubleshooting

| Problema | Solución |
|----------|----------|
| Error al ejecutar npm | Cambia la política de ejecución: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| No se ve el juego cargado | Asegúrate que los archivos de `src/views/` existan y que `npm install` completó sin errores |
| localStorage no funciona | En navegación privada/incógnita los navegadores bloquean localStorage |
| Cambios no se reflejan | El dev server debería recargar automáticamente; si no, recarga el navegador manualmente |

---

## 📦 Dependencias principales

- `vue@^3.5.22` - Framework Vue
- `vue-router@^4.x` - Routing
- `vite@^7.1.11` - Build tool

---

## ✨ Próximas mejoras (opcional)

- Sistema de mascotas múltiples
- Tienda para comprar accesorios
- Minijuegos dentro del juego
- Base de datos (Firebase) para guardar en la nube
- Multiplayer (comparar niveles con amigos)

---

**Hecho con ❤️ para la asignatura de DAW - Vue 3 & Vite**



