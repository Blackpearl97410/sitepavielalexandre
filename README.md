# Alexandre Paviel — Formation et conseil IA

Site vitrine d’Alexandre Paviel, formateur et consultant IA à La Réunion. Version HTML, CSS et JavaScript native, sans dépendance JavaScript externe. Un build statique léger prépare les fichiers publiables.

## Lancer en local

Depuis la racine du dépôt :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ouvrir [le site local](http://127.0.0.1:8765/index.html).

## Build et GitHub Actions

Avec Node.js 24 ou supérieur :

```sh
npm run build
```

Aucune installation de dépendances n’est nécessaire. Le build prépare `dist/` à partir des pages et médias suivis par Git, vérifie la syntaxe des scripts JavaScript externes et inline, et résout les fichiers locaux requis par le HTML et le CSS. Il ne lance pas les scripts dans un navigateur et ne teste pas les services externes.

L’Action **Compilation** exécute uniquement ce build sur les PR vers `main`, sur les push vers `main` et à la demande. Un seul job, délai maximal de cinq minutes, sans publication ni déploiement. La publication GitHub Pages existante reste indépendante de cette vérification.

## Fichiers

- `index.html` : page principale, huit offres, démonstrations, boîte à outils, tutorat, certifications, témoignages et FAQ.
- `assets/styles/` et `assets/scripts/` : styles et interactions, dont l’éventail des offres, les outils défilants et le consentement YouTube.
- `assets/images/`, `assets/videos/`, `assets/fonts/` : médias et polices servis localement.
- `mentions-legales.html`, `cgv.html`, `cgu.html`, `confidentialite.html`, `cookies.html` : informations légales et gestion des choix cookies.
- `LICENSE` et `CREDITS.md` : licence du gabarit et crédits des médias.

`index.gsap.html` et `previews/` sont des références conservées du gabarit original ; le site utilise `index.html`. Les originaux de travail, prompts, sauvegardes et captures de vérification restent hors de ce dépôt.

## Comportements

Les huit offres sont présentées en éventail avec commandes manuelles, rotation automatique et pause. Une grille complète reste accessible. Les animations respectent la préférence de réduction des mouvements.

Les treize outils défilent horizontalement, avec des commandes accessibles et une pause. La FAQ comporte cinq questions courtes. L’infographie des trois parcours RS peut être agrandie.

Le lecteur YouTube est chargé uniquement après accord. Le choix peut être modifié depuis « Mes choix cookies ». Le formulaire de contact prépare un email dans la messagerie du visiteur ; il ne transmet pas de message automatiquement.

## État de livraison

Version vérifiée localement sur ordinateur et mobile. Le site est publié avec GitHub Pages depuis `main` à la racine du dépôt. Le fichier `CNAME` réserve `pavielalexandre.com` pour ce site. Le pointage DNS et le certificat HTTPS doivent être validés dans les réglages Pages avant de considérer le domaine comme raccordé. Les informations légales relatives à l’adresse professionnelle complète, à l’hébergeur retenu et au médiateur désigné restent à compléter avant exploitation publique.

## Référencement (SEO et GEO)

- `index.html` porte la balise canonique, l’image de partage `assets/images/og-alexandre-paviel.jpg` (1200 × 630) et des données structurées JSON-LD (WebSite, Person, ProfessionalService avec les huit offres, FAQPage). Toute modification d’une offre ou d’une réponse de la FAQ doit être reportée dans ce bloc et dans `llms.txt`.
- `robots.txt`, `sitemap.xml` (dates `lastmod` à mettre à jour) et `llms.txt` (résumé factuel pour les assistants IA) sont à la racine.
- `favicon.ico`, `favicon-48.png` et `apple-touch-icon.png` remplacent l’icône intégrée. `404.html` sert les adresses inconnues.
- `index.gsap.html` est marqué `noindex` pour éviter un doublon de la page principale.

## Licence

Adaptation du gabarit [8B — Design Studio Website Template](https://github.com/8bsite/design-studio-website-template), sous licence MIT. Voir [LICENSE](LICENSE) et [CREDITS.md](CREDITS.md).
