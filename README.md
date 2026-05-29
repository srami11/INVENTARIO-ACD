# Inventario Zarey v3

Aplicación web estática para inventario por sedes, lista para GitHub Pages.

## Cambios de esta versión

- La aplicación ya no muestra todo en una sola página.
- Tiene secciones separadas: Tablero, Inventario, Movimientos, Excel y Sedes.
- Se corrigieron los botones de exportar inventario y descargar plantilla.
- Se eliminó el botón de borrar todos los datos.
- Se agregó eliminación puntual de una referencia por sede o en todas las sedes.
- Los nombres de sedes son editables.

## Formato de Excel para importar

Columnas aceptadas:

- Sede
- Tipo: ENTRADA, SALIDA o SET
- Referencia
- Descripcion
- Talla
- Color
- Cantidad

SET deja la cantidad exacta. ENTRADA suma. SALIDA resta.

## Cómo actualizar en GitHub Pages

1. Descomprime este ZIP.
2. Entra a tu repositorio de GitHub.
3. Sube y reemplaza estos archivos:
   - index.html
   - styles.css
   - app.js
   - README.md
4. Confirma los cambios con Commit changes.
5. Espera unos segundos y abre nuevamente tu página publicada.
6. Si no ves cambios, presiona Ctrl + F5 para recargar sin caché.

## Nota importante sobre datos dinámicos

Esta versión guarda la información en el navegador usando localStorage. Eso significa que no necesitas pagar dominio ni servidor, pero los datos quedan en el computador/navegador donde se actualizan.

Para que varias personas vean y editen el mismo inventario en tiempo real desde diferentes computadores, GitHub Pages no es suficiente porque solo sirve archivos estáticos. Para eso se necesita una base de datos externa como Firebase, Supabase, Airtable o Google Sheets API.
