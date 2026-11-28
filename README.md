# Alexandre Paviel — Formation et conseil IA

Site vitrine d’Alexandre Paviel, formateur et consultant IA à La Réunion. Version HTML, CSS et JavaScript avec une copie locale de Three.js pour la vue éclatée 3D. Un build statique léger prépare les fichiers publiables.

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
# Build et contrôles de sécurité de la sortie publiable :
npm run check
```

Aucune installation de dépendances n’est nécessaire. Le build prépare `dist/` à partir des pages et médias suivis par Git, vérifie la syntaxe des scripts JavaScript externes et inline, et résout les fichiers locaux requis par le HTML et le CSS. Il ne lance pas les scripts dans un navigateur et ne teste pas les services externes.

Le build insère dans les pages publiables une CSP et une politique de référent. Les empreintes SHA-256 des scripts inline sont recalculées à chaque build ; les scripts externes doivent venir du site. Le lecteur YouTube conserve son contrôle de consentement. Les styles inline restent autorisés pour les animations existantes. La réponse de vérification Google est conservée telle quelle.

L’Action **Compilation et publication** prépare le build et exécute les contrôles de sécurité sur les PR vers `main`, sur les push vers `main` et à la demande. Sur `main` uniquement, un second job peut publier l’artefact `dist/` via GitHub Pages ; les PR ne disposent pas des permissions de déploiement. Le gabarit `index.gsap.html`, les aperçus, scripts de build et documents de travail sont exclus de l’artefact.

**Activation nécessaire :** le contrôle du 28/11/2026 a confirmé que le dépôt GitHub publie encore la racine de `main` en mode historique. Le workflow préparé ici exige de sélectionner **Settings → Pages → Source → GitHub Actions** et de publier les fichiers de cette correction. Tant que cette bascule et un déploiement réussi ne sont pas vérifiés, la présence de la CSP et l’exclusion du gabarit ne sont pas acquises en ligne.

Pour examiner les fichiers réellement publiables sans navigateur :

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
curl -I http://127.0.0.1:8765/
```

La CSP est délivrée par une balise HTML, pas par un en-tête HTTP. HSTS, `X-Content-Type-Options`, `Permissions-Policy` et la protection contre l’intégration en iframe (`frame-ancestors` / `X-Frame-Options`) exigent des en-têtes réels ; ils ne sont pas simulés dans les pages. Leur ajout doit être traité avec la couche d’hébergement qui maîtrise ces en-têtes.

## Fichiers

- `index.html` : page principale, huit offres, démonstrations, boîte à outils, tutorat, certifications, témoignages et FAQ.
- `assets/styles/` et `assets/scripts/` : styles et interactions, dont l’éventail des offres, les outils défilants et le consentement YouTube.
- `assets/vendor/three/` : Three.js 0.187.0, modules et licence MIT servis localement.
- `assets/images/`, `assets/videos/`, `assets/fonts/` : médias et polices servis localement.
- `mentions-legales.html`, `cgv.html`, `cgu.html`, `confidentialite.html`, `cookies.html` : informations légales et gestion des choix cookies.
- `LICENSE` et `CREDITS.md` : licence du gabarit et crédits des médias.

`index.gsap.html` et `previews/` sont des références conservées du gabarit original ; le site utilise `index.html`. Les originaux de travail, prompts, sauvegardes et captures de vérification restent hors de ce dépôt.

## Comportements

La vue éclatée utilise des géométries, éclairages et ombres WebGL 2. Le module Three.js se charge à l’approche de la section, sans service tiers. Les rendus sont suspendus à l’arrêt et hors écran ; la réduction des mouvements supprime les transitions. Les boutons et la touche Échap restent utilisables au clavier. La vue CSS sert de secours sans WebGL, lors d’une perte du contexte graphique et à l’ouverture directe du fichier HTML ; utiliser le serveur local ci-dessus pour voir la 3D.

Les huit offres sont présentées en éventail avec commandes manuelles, rotation automatique et pause. Une grille complète reste accessible. Les animations respectent la préférence de réduction des mouvements.

Sur écran tactile, un balayage horizontal sur la carte passe à l’offre suivante ou précédente. Le défilement vertical et le zoom restent natifs. Le geste est désactivé dans la grille et pendant la lecture des détails ; un simple appui conserve l’ouverture « En savoir plus ».

Les treize outils défilent horizontalement, avec des commandes accessibles et une pause. Un geste tactile, un défilement horizontal au pavé tactile ou une flèche passe en lecture manuelle ; « Reprendre » relance le défilement automatique. L’inertie tactile reste gérée par le navigateur. La FAQ comporte cinq questions courtes. L’infographie des trois parcours RS peut être agrandie.

Le lecteur YouTube est chargé uniquement après accord. Le choix peut être modifié depuis « Mes choix cookies ». Le formulaire de contact prépare un email dans la messagerie du visiteur ; il ne transmet pas de message automatiquement.

## État de livraison

Le contrôle réseau du 28/11/2026 a confirmé la réponse HTTPS de `pavielalexandre.com`, la redirection HTTP et `www` vers le domaine principal, les DNS GitHub Pages et un certificat valide jusqu’au 24/02/2027. La publication observée utilise encore `main` à la racine. Le fichier `CNAME` est conservé dans `dist/`, et le domaine personnalisé doit rester déclaré dans les réglages Pages lors de la bascule vers Actions. Les corrections de sécurité de cette version ont été contrôlées statiquement, sans nouveau test navigateur. Les informations légales relatives à l’adresse professionnelle complète, à l’hébergeur retenu et au médiateur désigné restent à compléter avant exploitation publique.

## Référencement (SEO et GEO)

- `index.html` porte la balise canonique, l’image de partage `assets/images/og-alexandre-paviel.jpg` (1200 × 630) et des données structurées JSON-LD (WebSite, Person, ProfessionalService avec les huit offres, FAQPage). Toute modification d’une offre ou d’une réponse de la FAQ doit être reportée dans ce bloc et dans `llms.txt`.
- `robots.txt`, `sitemap.xml` (dates `lastmod` à mettre à jour) et `llms.txt` (résumé factuel pour les assistants IA) sont à la racine.
- `favicon.ico`, `favicon-48.png` et `apple-touch-icon.png` remplacent l’icône intégrée. `404.html` sert les adresses inconnues.
- `index.gsap.html` est marqué `noindex` pour éviter un doublon de la page principale.

## Licence

Adaptation du gabarit [8B — Design Studio Website Template](https://github.com/8bsite/design-studio-website-template), sous licence MIT. Voir [LICENSE](LICENSE) et [CREDITS.md](CREDITS.md).
