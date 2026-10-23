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
  js/    common · i18n · i18n-dict · menu · hero-chip · steps · reveal · contact-form
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
| Překlady (PL, DE) | `assets/js/i18n-dict.js` |

CSS se načítá v pořadí uvedeném v `<head>` v `index.html` — nové soubory přidávejte před `responsive.css`.

## Jazyky (CS / PL / DE)

Čeština je přímo v HTML (SEO, funguje i bez JS). Přepínač `CS | PL | DE` v hlavičce přeloží celou stránku včetně titulků, meta popisů, placeholderů a hlášek formuláře; volba se pamatuje v prohlížeči (`?lang=pl` ji nastaví odkazem).

- Překlady jsou v `assets/js/i18n-dict.js` jako řádky `[čeština, polština, němčina]`. **Český text je klíč** — když změníte text v HTML, upravte ho i tam, jinak se v PL/DE zobrazí česky.
- Chybějící překlady zjistíte v konzoli: `MV_I18N_DEBUG = true; MV.setLang('pl')`.
- Nový jazyk: přidejte sloupec do `i18n-dict.js`, kód do `LANGS` v `i18n.js` a tlačítko do přepínače.
- Formulář posílá do webhooku navíc pole `jazyk` (cs/pl/de).

## Výkon

- 3D čip (~500 kB) se stahuje až po načtení stránky (`hero-chip.js`); do té doby je vidět obrázek. Při úsporném režimu dat nebo bez WebGL se nestahuje vůbec.
- Písma jsou hostovaná přímo na webu, žádné externí požadavky ani cookies.
- Respektuje `prefers-reduced-motion`.

## Lokální náhled

```
npx http-server . -p 8080
```
(Otevření `index.html` dvojklikem funguje, ale 3D čip se z disku nenačte.)

## Formulář (Make.com webhook)

Formulář posílá data (jmeno, klub, email, telefon, zprava, predmet, odeslano, stranka) na webhook v `assets/js/contact-form.js` (konstanta `WEBHOOK`). Make scénář z nich odešle Gmail.
