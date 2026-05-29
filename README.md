# Inventario Zarey

Aplicación web estática para controlar inventario por 3 sedes y ver el inventario madre consolidado.

## Funciones incluidas

- Inventario madre consolidado.
- 3 sedes individuales.
- Nombres editables para cada sede.
- Agregar producto manualmente.
- Movimientos: SET, ENTRADA y SALIDA.
- Importación Excel/CSV.
- Exportación Excel.
- Plantilla de importación.
- Guardado automático en el navegador con LocalStorage.

## Columnas para importar

El archivo debe tener estas columnas:

- Referencia
- Descripcion
- Talla
- Color
- Cantidad
- Sede
- Movimiento

Movimiento puede ser:

- SET: define la cantidad exacta.
- ENTRADA: suma unidades.
- SALIDA: resta unidades.

En la columna Sede puedes escribir:

- SEDE_1, SEDE_2, SEDE_3
- O el nombre personalizado que configuraste en la aplicación.

## Publicar gratis en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos archivos:
   - index.html
   - styles.css
   - app.js
   - README.md
3. Entra a Settings.
4. Entra a Pages.
5. En Branch selecciona main y /root.
6. Guarda.
7. GitHub generará una URL pública.

## Sobre inventario dinámico actualizable

Esta versión sí se actualiza automáticamente en el mismo navegador: cada cambio manual o importación queda guardado sin necesidad de exportar Excel.

Pero GitHub Pages solo publica archivos estáticos. Eso significa que no tiene una base de datos central. Por eso, si abres la página desde otro computador, celular o navegador, no verá el mismo inventario actualizado automáticamente.

Para que varias personas vean y actualicen el mismo inventario en tiempo real se necesita una base de datos externa, por ejemplo:

- Firebase
- Supabase
- Google Sheets API
- Airtable
- Un backend propio

La exportación Excel sigue siendo importante como respaldo y para mover información entre equipos si se usa solo GitHub Pages.
