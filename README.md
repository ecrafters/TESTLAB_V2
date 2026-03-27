# TestLab v2 - E2E Tests (Playwright)

Ce projet contient les tests automatisés End-to-End (E2E) pour les applications **Eyone** (TestLab v2) utilisant [Playwright](https://playwright.dev/).

## 📋 Prérequis

- **Node.js** : Version 20 (recommandée) ou >18.
- **NPM** : Inclus avec Node.js.

## 🚀 Installation

1.  **Cloner le projet**
    ```bash
    git clone <url-du-repo>
    cd TestLab_v2
    ```

2.  **Installer les dépendances**
    ```bash
    npm i
    ```

3.  **Installer les navigateurs Playwright**
    ```bash
    npx playwright install --with-deps
    ```

## 📂 Structure du Projet

```plaintext
TestLab_v2/
├── config/                 # Configuration des environnements
│   ├── env.dev.json        # Config pour DEV
│   ├── env.preprod.json    # Config pour PREPROD
│   ├── env.prod.json       # Config pour PROD
│   └── env.loader.ts       # Service de chargement de config
├── tests/                  # Fichiers de tests
│   ├── Patrimoine_Test_SI_Medical/
│   │   ├── 00_TNR-Patient/
│   │   └── ...
├── playwright.config.ts    # Configuration globale Playwright
├── package.json            # Scripts et dépendances
└── .github/workflows/      # Pipelines CI/CD
```

## ⚙️ Configuration

Les tests s'exécutent sur différents environnements configurés dans le dossier `config/`.
L'environnement cible est contrôlé par la variable `NODE_ENV`.

### Environnements disponibles
- `dev`
- `preprod` (défaut)
- `recipe`
- `prod`

## ▶️ Exécuter les tests

### Commandes par environnement

Les commandes suivantes exécutent tous les tests sur l'environnement spécifié.

| Environnement | Commande | Avec Interface (UI) | Mode Tête (Headed) |
|---|---|---|---|
| **Preprod** | `npm run test:preprod` | `npm run test:preprod:ui` | `npm run test:preprod:headed` |
| **Dev** | `npm run test:dev` | `npm run test:dev:ui` | `npm run test:dev:headed` |
| **Recette** | `npm run test:recipe` | `npm run test:recipe:ui` | `npm run test:recipe:headed` |
| **Prod** | `npm run test:prod` | - | `npm run test:prod:headed` |

### Autres commandes utiles

- **Débogage** : `npm run test:debug`
- **Ouvrir le rapport** : `npm run report`
- **Nettoyer les rapports** : `npm run clean-reports`
- **Lanceur rapide Patient (Headed)** : `npm run test:patient`

### Exécuter un test spécifique

```bash
# Exemple pour un fichier spécifique en preprod (headed)
npx playwright test tests/Patrimoine_Test_SI_Medical/00_TNR-Patient/00_TNR-Patient.spec.ts --headed
```

## 🤖 CI/CD (GitHub Actions)

Les pipelines sont définis dans `.github/workflows/`.

### Workflows automatisés

1.  **Playwright Tests** (`playwright.yml`) :
    - Se lance sur `push` et `pull_request` vers `main` ou `develop`.
    - Exécute tous les tests.

2.  **Playwright - TNR Patient (Preprod)** (`playwright-tnr-patient.yml`) :
    - **Planifié** : Se lance automatiquement à 08h, 12h et 16h (UTC).
    - **Manuel** : Peut être lancé manuellement via l'onglet "Actions" de GitHub.
    - **Périmètre** : Exécute uniquement les tests du dossier `00_TNR-Patient`.
    - **Notifications** : Envoie un email avec le rapport détaillé (succès/échec, étapes validation, erreurs) via Gmail.

## 📊 Rapports et Artefacts

Les rapports HTML sont générés automatiquement dans le dossier `playwright-report/`.
En CI, les rapports sont disponibles en téléchargement dans les artefacts du run GitHub Actions.

- **Screenshots** : Uniquement sur échec
- **Vidéos** : Conservées sur échec
- **Traces** : Activées au premier retry
