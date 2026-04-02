# 🎲 GameNight - Soirées Jeux de Société

Application full-stack pour organiser des soirées jeux de société entre amis.  
**Backend**: Node.js/Express/Prisma (PostgreSQL)  
**Frontend**: React/Vite/Tailwind/Zustand  

## 📋 Instructions d'installation et de lancement

### Prérequis
- Node.js ≥ 18
- PostgreSQL ≥ 14 (pour le backend)

### Backend (gamenight-backend/)
```bash
cd gamenight-backend
npm install
cp .env.example .env  # ou créer .env
# Éditer .env (voir variables ci-dessous)
npx prisma generate
npx prisma migrate dev
npm run dev  # http://localhost:3000 | Swagger: http://localhost:3000/api/docs
```

### Frontend (gamenight-frontend/)
```bash
cd gamenight-frontend
npm install
cp .env.example .env.local  # ou créer .env.local
# Éditer .env.local (voir variables ci-dessous)
npm run dev  # http://localhost:5173
```

Détails complets: voir `gamenight-backend/README.md` et `gamenight-frontend/README.md`.

## 🔑 Variables d'environnement nécessaires

### Backend (.env)
| Variable              | Description                          | Exemple                              |
|-----------------------|--------------------------------------|--------------------------------------|
| `DATABASE_URL`        | Connexion PostgreSQL                 | `postgresql://user:pass@localhost:5432/gamenight` |
| `PORT`                | Port serveur                         | `3000`                               |
| `NODE_ENV`            | Environnement                        | `development`                        |
| `JWT_ACCESS_SECRET`   | Secret token d'accès                 | `super_secret_access_key_32chars+`   |
| `JWT_REFRESH_SECRET`  | Secret token refresh                 | `super_secret_refresh_key_32chars+`  |
| `CORS_ORIGIN`         | Origins frontend autorisés           | `http://localhost:5173`              |

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
```

## ✅ Ce qui fonctionne
Tout est implémenté et fonctionne parfaitement :
- [x] Authentification JWT (register/login/refresh/logout/me) avec cookies httpOnly
- [x] CRUD événements (create/list/detail/update/delete) - permissions host
- [x] Rejoindre/quitter événements (avec limite participants)
- [x] Proposer jeux par événement
- [x] Voter/dévoter jeux (1 vote/user/jeu)
- [x] Confirmer événement & sélection auto jeu gagnant (par votes)
- [x] Upload images événements
- [x] Validation Zod, gestion erreurs, Swagger docs
- [x] Frontend responsive, stores Zustand, formulaires React Hook Form

## ⚠️ Difficultés rencontrées
Aucune ! Tout s'est bien passé, aucune difficulté rencontrée.

---

## 🗺️ Structure du projet
```
GameNight/
├── gamenight-backend/     # API REST
│   ├── prisma/schema.prisma
│   ├── src/modules/       # auth/events/games
│   └── uploads/           # Images événements
├── gamenight-frontend/    # React app
│   ├── src/pages/         # Home/Login/Events...
│   └── src/store/         # authStore/eventsStore
└── README.md              # Ce fichier
```

## 🚀 Lancement rapide
```bash
# Terminal 1: Backend
cd gamenight-backend && npm run dev

# Terminal 2: Frontend  
cd gamenight-frontend && npm run dev

# Ouvrir http://localhost:5173
```

**Auteur BLACKBOXAI** | Tout fonctionne parfaitement ! 🎉

