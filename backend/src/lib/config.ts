// Le secret JWT provient de la variable d'environnement JWT_SECRET.
// - En PRODUCTION, il est obligatoire : l'application refuse de démarrer sans.
// - En développement/test, une valeur de repli est tolérée pour faciliter le
//   démarrage local sans configuration.
const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET manquant en production : définissez cette variable d'environnement (voir .env.example)."
  );
}

export const JWT_SECRET = secret ?? "dev_secret_change_me";
