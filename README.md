# 🧑‍💻 Desatrófiate

Aplicación web progresiva (PWA) para trabajadores de oficina: 25 minutos de ejercicios basados en 30+ estudios científicos para contrarrestar las horas de ordenador y rescatar tu postura.

## 🚀 Características

- ✅ **Rutina científicamente respaldada** - Basada en 30+ estudios peer-reviewed
- ✅ **PWA instalable** - Funciona offline y se puede instalar como app nativa
- ✅ **Seguimiento de progreso** - Guarda tu progreso en localStorage
- ✅ **3 niveles de dificultad** - Principiante, intermedio y avanzado
- ✅ **Temporizadores integrados** - Para ejercicios con duración específica
- ✅ **Información detallada** - Cada ejercicio incluye músculos trabajados, evidencia científica y consejos
- ✅ **SEO optimizado** - Meta tags completos para redes sociales

## 🛠️ Stack Tecnológico

- **Framework**: [Astro](https://astro.build/) v4
- **CSS**: [Tailwind CSS](https://tailwindcss.com/) v3
- **Despliegue**: [Vercel](https://vercel.com/)
- **PWA**: Service Worker + Web Manifest

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar servidor de desarrollo
pnpm run dev

# Compilar para producción
pnpm run build

# Preview de la build
pnpm run preview
```

## 🎨 Generar Iconos para PWA

Los iconos actualmente son placeholders. Para generar iconos reales:

### Opción 1: Usar una herramienta online
1. Ve a [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Sube tu logo/icono
3. Descarga el paquete completo
4. Reemplaza los archivos en `/public/`

### Opción 2: Usar comandos (requiere ImageMagick)

```bash
# Crear un icono base (ejemplo con emoji o logo)
# Luego usar ImageMagick para redimensionar:

convert favicon.svg -resize 192x192 public/icon-192.png
convert favicon.svg -resize 512x512 public/icon-512.png
convert favicon.svg -resize 180x180 public/apple-touch-icon.png
```

### Opción 3: Usar Figma/Canva
1. Diseña un icono de 512x512px
2. Exporta en los siguientes tamaños:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `apple-touch-icon.png` (180x180px)
   - `og-image.png` (1200x630px) - para compartir en redes sociales

Los iconos deben tener:
- Fondo sólido (no transparente para mejor compatibilidad)
- Diseño simple y reconocible
- Colores que contrasten bien

## 🌐 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repo-url>
git push -u origin main
```

2. Ve a [vercel.com](https://vercel.com)
3. Clic en "New Project"
4. Importa tu repositorio
5. Vercel detectará automáticamente Astro
6. Clic en "Deploy"

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

### Variables de Entorno (Opcional)

Si necesitas agregar variables de entorno (como Google Analytics):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables necesarias
4. Redeploy el proyecto

## 📁 Estructura del Proyecto

```
desatrofiate/
├── public/
│   ├── favicon.svg           # Favicon SVG
│   ├── icon-192.png          # Icono PWA 192x192
│   ├── icon-512.png          # Icono PWA 512x512
│   ├── apple-touch-icon.png  # Icono Apple 180x180
│   ├── og-image.png          # Open Graph image 1200x630
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service Worker
├── src/
│   ├── components/
│   │   └── icons/            # Componentes de iconos SVG
│   ├── data/
│   │   ├── exerciseDetails.ts  # Detalles de ejercicios
│   │   ├── references.ts       # Referencias científicas
│   │   └── workout.ts          # Estructura del workout
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout principal con SEO
│   └── pages/
│       └── index.astro         # Página principal
├── astro.config.mjs          # Configuración de Astro
├── tailwind.config.mjs       # Configuración de Tailwind
├── tsconfig.json             # Configuración de TypeScript
├── vercel.json               # Configuración de Vercel
└── package.json              # Dependencias
```

## 🔧 Configuración

### Cambiar el dominio

Edita `astro.config.mjs`:

```js
export default defineConfig({
  // ...
  site: 'https://tu-dominio.com',
});
```

### Personalizar colores

Edita `tailwind.config.mjs` para cambiar los colores del tema.

### Agregar Google Analytics

Agrega en `src/layouts/BaseLayout.astro` dentro del `<head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 📱 Probar PWA Localmente

1. Ejecuta la build: `npm run build`
2. Sirve la build: `npm run preview`
3. Abre Chrome DevTools
4. Ve a Application → Service Workers
5. Verifica que el SW esté registrado
6. Ve a Application → Manifest
7. Verifica que el manifest sea válido

## 🐛 Troubleshooting

### El Service Worker no se registra

- Verifica que estés en HTTPS (o localhost)
- Limpia la cache del navegador
- Revisa la consola por errores

### Los iconos no aparecen

- Verifica que los archivos PNG existan en `/public/`
- Verifica que las rutas en `manifest.json` sean correctas
- Limpia la cache y recarga

### Errores de build

- Ejecuta `pnpm install` de nuevo
- Verifica que Node.js sea v18 o superior
- Revisa los logs de error en Vercel

## 📚 Referencias Científicas

La aplicación incluye referencias a más de 30 estudios científicos. Puedes verlos haciendo clic en "Ver Referencias Científicas" en la app.

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios que te gustaría hacer.

## 📧 Contacto

Si tienes preguntas o sugerencias, abre un issue en el repositorio.

---

Hecho con 🧑‍💻 y basado en ciencia 🔬
