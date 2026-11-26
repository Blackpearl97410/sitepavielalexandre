# Alexandre Paviel — Formation et conseil IA

Site vitrine d’Alexandre Paviel, formateur et consultant IA à La Réunion. Version HTML, CSS et JavaScript native, sans dépendance JavaScript externe et sans étape de compilation.

## Lancer en local

Depuis la racine du dépôt :

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ouvrir [le site local](http://127.0.0.1:8765/index.html).

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

Version vérifiée localement sur ordinateur et mobile. Ce dépôt contient les fichiers du site ; il ne configure pas d’hébergement. Les informations légales relatives à l’adresse professionnelle complète, à l’hébergeur retenu et au médiateur désigné restent à compléter avant exploitation publique.

## Licence

Adaptation du gabarit [8B — Design Studio Website Template](https://github.com/8bsite/design-studio-website-template), sous licence MIT. Voir [LICENSE](LICENSE) et [CREDITS.md](CREDITS.md).
