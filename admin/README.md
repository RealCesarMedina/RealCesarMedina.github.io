# Panel de administración

Editor visual del sitio. Permite añadir, editar y eliminar publicaciones, y subir PDFs sin tocar código.

## Cómo entrar

1. Visita **https://realcesarmedina.github.io/admin/**
2. Haz clic en *Login with GitHub* (o *Iniciar sesión con GitHub*)
3. Autoriza con tu cuenta de GitHub (la dueña del repositorio)
4. Listo — ves la lista de publicaciones

## Cómo añadir una **investigación** (PDF)

1. Una vez dentro, abre la pestaña **Asset Library** (biblioteca de archivos) en la barra superior
2. Pulsa **Upload** y selecciona el PDF desde tu computadora
3. Cuando termine de subir, verás el archivo en la galería — **copia su ruta** (algo como `/assets/docs/nombre.pdf`)
4. Vuelve a la sección **Publicaciones → Listado completo**
5. Pulsa **+** para añadir una publicación nueva (al inicio de la lista)
6. Llena los campos:
   - **ID**: el siguiente número libre (si la última fue 2, escribe 3)
   - **Tipo**: *Investigación / Estudio (PDF)*
   - **Título**: el título completo del paper
   - **Fecha**: la fecha de publicación
   - **Descripción**: 2–4 líneas de resumen
   - **Etiquetas**: las palabras clave (Macroeconomía, Inflación, …)
   - **Enlace al documento**: pega la ruta del PDF (`./assets/docs/nombre.pdf` — añade el `.` al inicio)
   - **Pieza destacada**: activa esta opción si quieres que aparezca en el hero del homepage
7. Pulsa **Save** (arriba a la derecha)

GitHub Pages reconstruirá el sitio en ~1 minuto y la nueva publicación aparecerá en vivo.

## Cómo añadir un **artículo de opinión**

⚠️ Por ahora, el artículo HTML necesita ser creado manualmente (o pidiéndomelo a mí — Claude). Esto cambiará en una siguiente versión donde podrás escribir artículos en markdown directamente desde el panel.

Una vez que el archivo HTML existe en `articles/`:

1. Abre **Publicaciones → Listado completo**
2. Pulsa **+**
3. Llena los campos. En **Enlace al documento** pon `./articles/nombre-articulo.html`
4. Tipo = *Artículo de opinión*
5. **Save**

## Cómo **editar** una publicación existente

1. **Publicaciones → Listado completo**
2. Verás todas las publicaciones colapsadas. Haz clic en la fila para expandirla
3. Modifica los campos que necesites
4. **Save**

## Cómo **eliminar** una publicación

1. **Publicaciones → Listado completo**
2. Expande la publicación
3. Pulsa el ícono de basura (🗑) en su esquina
4. **Save**

⚠️ Eliminar la entrada **NO** elimina el archivo PDF de `assets/docs/`. Si quieres limpiar el PDF también:
- Abre **Asset Library**
- Selecciona el archivo
- Pulsa eliminar

## Pieza destacada del hero

El homepage muestra **una sola** pieza destacada en la cabecera. Si tienes varias con `featured: true`, gana **la más reciente por fecha**. Para cambiar cuál se destaca:
- Activa `featured` en la que quieres destacar
- Desactívala en las demás (opcional, pero más limpio)

## Solución de problemas

**No puedo iniciar sesión.** El servicio de autenticación de Sveltia CMS es gratuito y compartido. Si está caído, espera unos minutos. Para una solución más permanente, podemos auto-hospedar el OAuth proxy en Cloudflare Pages (10 minutos de configuración).

**Mis cambios no aparecen en el sitio.** Esperá 1–2 minutos para que GitHub Pages reconstruya. Si tras 5 minutos no aparecen, abre https://github.com/RealCesarMedina/RealCesarMedina.github.io/actions y revisa si hay errores.

**Subí el PDF pero no encuentro la ruta.** Las subidas van a `assets/docs/`. La ruta que debes pegar es `./assets/docs/nombre-del-archivo.pdf` (con el `./` al inicio).
