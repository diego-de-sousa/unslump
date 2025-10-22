# 🚀 Guía de Despliegue - Desatrófiate

## ✅ Estado del Proyecto

Tu proyecto Astro está listo para desplegar en Vercel. El build se completó exitosamente.

## 📋 Pasos Siguientes

### 1. Generar Iconos Reales para PWA

Actualmente los iconos son placeholders. Necesitas generar iconos reales:

**Opción Rápida - Usar herramientas online:**
1. Ve a [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Sube tu logo (puede ser el emoji 🧑‍💻 o un diseño personalizado)
3. Descarga el paquete completo
4. Reemplaza estos archivos en `/public/`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
   - `apple-touch-icon.png` (180x180px)
   - `og-image.png` (1200x630px)
   - `favicon.svg`

**Opción Manual - Crear con Canva/Figma:**
1. Crea un diseño simple de 512x512px
2. Exporta en los tamaños mencionados arriba
3. Coloca los archivos en `/public/`

### 2. Probar Localmente

```bash
# Ejecutar servidor de desarrollo
pnpm run dev

# Compilar y previsualizar (recomendado antes de desplegar)
pnpm run build
pnpm run preview
```

Abre http://localhost:4321 y verifica:
- ✅ Todos los ejercicios se muestran correctamente
- ✅ Los temporizadores funcionan
- ✅ El progreso se guarda en localStorage
- ✅ Los modales se abren y cierran correctamente
- ✅ Los niveles de dificultad cambian la información

### 3. Probar PWA Localmente

1. Ejecuta `pnpm run build && pnpm run preview`
2. Abre Chrome DevTools (F12)
3. Ve a **Application** → **Service Workers**
   - Deberías ver el SW registrado
4. Ve a **Application** → **Manifest**
   - Verifica que no haya errores
5. Ve a **Lighthouse** → Selecciona "Progressive Web App" → "Generate report"

### 4. Desplegar en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. **Crear repositorio en GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Desatrófiate PWA"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/desatrofiate.git
   git push -u origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio
   - Vercel detectará automáticamente que es un proyecto Astro
   - Clic en **Deploy**

3. **Configuración automática:**
   - Build Command: `pnpm run build` ✅
   - Output Directory: `.vercel/output` ✅
   - Install Command: `pnpm install` ✅

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Desplegar (primera vez)
vercel

# Para producción
vercel --prod
```

### 5. Después del Despliegue

1. **Actualizar el dominio** en `astro.config.mjs`:
   ```js
   site: 'https://tu-app.vercel.app'
   ```

2. **Volver a desplegar** para que los meta tags tengan la URL correcta

3. **Probar en dispositivos móviles:**
   - Abre la URL en tu smartphone
   - En Chrome/Safari: "Agregar a pantalla de inicio"
   - Verifica que funcione como app standalone

4. **Verificar PWA:**
   - Ve a tu URL en Chrome Desktop
   - Clic derecho → **Inspeccionar** → **Lighthouse**
   - Genera reporte PWA (debería tener >90 de score)

### 6. Configuración Opcional

#### Agregar Google Analytics

Edita `src/layouts/BaseLayout.astro`, agrega antes del `</head>`:

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

#### Dominio Personalizado

1. Ve a tu proyecto en Vercel
2. **Settings** → **Domains**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

## 🐛 Troubleshooting

### Error: "Service Worker failed to register"
- Asegúrate de estar en HTTPS (Vercel lo hace automáticamente)
- Limpia la cache del navegador
- Verifica que `/sw.js` exista en el build

### Error: "Manifest errors"
- Verifica que los iconos existan en `/public/`
- Asegúrate de que las rutas en `manifest.json` sean correctas
- Los iconos deben ser PNG, no JPG

### Error de build en Vercel
- Verifica que `pnpm install` funcione localmente
- Revisa los logs en Vercel para ver el error específico
- Asegúrate de que `astro.config.mjs` esté bien configurado

## 📊 Checklist Pre-Despliegue

- [ ] Iconos PWA generados y reemplazados
- [ ] Build local exitoso (`pnpm run build`)
- [ ] Preview local probado (`pnpm run preview`)
- [ ] Service Worker registrándose correctamente
- [ ] Manifest sin errores
- [ ] Todas las funcionalidades probadas
- [ ] Repositorio Git creado y pusheado
- [ ] Proyecto importado en Vercel
- [ ] Primer despliegue exitoso
- [ ] PWA probada en móvil
- [ ] Lighthouse score >90 para PWA

## 🎉 ¡Listo!

Tu app estará disponible en una URL como:
- `https://desatrofiate.vercel.app`
- O tu dominio personalizado

Los usuarios podrán:
- ✅ Instalarla como app nativa
- ✅ Usarla offline
- ✅ Guardar su progreso
- ✅ Acceder a 30+ referencias científicas
- ✅ Seguir rutinas personalizadas por nivel

## 📚 Recursos Útiles

- [Documentación de Astro](https://docs.astro.build)
- [Documentación de Vercel](https://vercel.com/docs)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Favicon Generator](https://realfavicongenerator.net/)

---

¿Preguntas? Revisa el README.md o abre un issue en GitHub.
