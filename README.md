# MATCHVISION — matchvision.cz

Statický web (HTML + CSS + JS, bez build kroku) pro GitHub Pages. Stačí nahrát soubory, nic se nekompiluje.

## Struktura

```
index.html                      hlavní stránka (texty a obsah)
ochrana-osobnich-udaju.html     ochrana osobních údajů (doplnit žluté [závorky])
404.html                        stránka pro neplatný odkaz
sitemap.xml, robots.txt         pro Google (po změně stránek upravte <lastmod>)
site.webmanifest, favicon.*, apple-touch-icon.png, og-image.jpg
CNAME                           doména matchvision.cz — nemazat
assets/
  css/   fonts · base (barvy, reset) · buttons · header · hero · statement-services
         process · about · contact · footer · animations · responsive · subpages
  js/    common · menu · hero-chip · steps · reveal · contact-form
         vendor/mvchip.js       3D čip (three.js, minifikovaný — needitovat)
  img/   logo-matchvision.png (logo v hlavičce, patičce i na 404) + fotky, ikony
  fonts/, textures/
```

## Kde co změnit

| Chci změnit | Soubor |
|---|---|
| Text, odkazy, SEO titulky | `index.html` |
| Barvy, velikost písma, mezery | `assets/css/base.css` (proměnné v `:root`) |
| Vzhled konkrétní sekce | CSS soubor stejného jména (např. `contact.css`) |
| Mobilní / tabletové zobrazení | `assets/css/responsive.css` |
| Fotky týmu | `assets/img/tomas.jpg`, `daniel.jpg` (420×420 px, stejný název) |
| Formulář | `assets/js/contact-form.js` + `access_key` v `index.html` |
| Menu na mobilu | `assets/js/menu.js` |

CSS se načítá v pořadí uvedeném v `<head>` v `index.html` — nové soubory přidávejte před `responsive.css`.

## Výkon

- 3D čip (~500 kB) se stahuje až po načtení stránky (`hero-chip.js`); do té doby je vidět obrázek. Při úsporném režimu dat nebo bez WebGL se nestahuje vůbec.
- Písma jsou hostovaná přímo na webu, žádné externí požadavky ani cookies.
- Respektuje `prefers-reduced-motion`.

## Lokální náhled

```
npx http-server . -p 8080
```
(Otevření `index.html` dvojklikem funguje, ale 3D čip se z disku nenačte.)

## Formulář (Web3Forms)

Vložte přístupový klíč do `<input type="hidden" name="access_key" value="">` v `index.html`. Bez klíče se otevře předvyplněný e-mail na team@matchvision.cz.
