# 🛡️ Tutoriel d'Intégration Keycloak avec NextAuth.js v5 (Next.js 16)

Ce guide pas à pas détaille comment migrer ou intégrer **Keycloak** comme fournisseur d'identité principal pour **Epi Manager** en utilisant **NextAuth.js v5 (Auth.js)** sous **Next.js 16**.

---

## 🛠️ Partie 1 : Configuration dans la console d'administration Keycloak

### 1. Création du Realm
1. Connectez-vous à votre console d'administration Keycloak.
2. Dans le menu déroulant en haut à gauche, cliquez sur **Create Realm**.
3. Nommez le Realm `stef-epi` (ou le nom de votre choix) et cliquez sur **Create**.

### 2. Création du Client OpenID Connect (OIDC)
1. Allez dans **Clients** dans le menu de gauche, puis cliquez sur **Create client**.
2. **General settings** :
   - **Client type** : `OpenID Connect`
   - **Client ID** : `epi-manager-app`
   - **Name** : `Epi Manager`
   - Cliquez sur **Next**.
3. **Capability config** :
   - **Client authentication** : Activez-le (`On`) — *ceci rend le client confidentiel et génère un Secret*.
   - **Authorization** : Laissez désactivé (sauf si vous souhaitez utiliser le moteur d'autorisation Keycloak avancé).
   - **Authentication flow** : Cochez **Standard flow** et **Direct access grants** (pour le debug/tests).
   - Cliquez sur **Next**.
4. **Login settings** :
   - **Root URL** : `http://localhost:3000` (ou votre URL de production)
   - **Home URL** : `http://localhost:3000`
   - **Valid redirect URIs** : `http://localhost:3000/api/auth/callback/keycloak` (très important pour NextAuth.js v5)
   - **Valid post logout redirect URIs** : `http://localhost:3000`
   - **Web origins** : `http://localhost:3000`
   - Cliquez sur **Save**.

### 3. Récupération du Client Secret
1. Toujours dans la configuration de votre client `epi-manager-app`, allez dans l'onglet **Credentials**.
2. Copiez la valeur du **Client Secret**. Vous en aurez besoin pour vos variables d'environnement.

### 4. Configuration des Rôles et Mappers (RBAC)
Pour que l'application puisse restreindre l'accès aux pages `/admin` et `/statistics` aux seuls utilisateurs avec le rôle `ADMIN` :
1. Allez dans **Realm roles** dans le menu de gauche.
2. Cliquez sur **Create role**, nommez-le `ADMIN` et sauvegardez. Créez également un rôle `USER`.
3. Attribuez ces rôles à vos utilisateurs de test dans la section **Users**.
4. **Mapper de rôles pour le Token** :
   - Par défaut, Keycloak inclut les rôles dans le token sous `realm_access.roles`.
   - Pour s'assurer que NextAuth reçoive correctement ces rôles dans le profil de l'utilisateur, assurez-vous que le scope client `roles` est bien associé au client dans l'onglet **Client scopes** > **Evaluate** ou configuré pour être inclus dans l'ID Token et l'Access Token.

---

## 💻 Partie 2 : Configuration du code Next.js 16 (NextAuth.js v5)

### 1. Installation des dépendances
Si ce n'est pas déjà fait, assurez-vous d'avoir la version v5 (Beta) de NextAuth :
```bash
npm install next-auth@beta
```

### 2. Mise à jour des variables d'environnement (`.env.local`)
Ajoutez les variables suivantes dans votre fichier `.env.local` :

```env
# Keycloak Configuration
AUTH_KEYCLOAK_ID=epi-manager-app
AUTH_KEYCLOAK_SECRET=votre_client_secret_keycloak
AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/stef-epi

# NextAuth Configuration
AUTH_SECRET=un_secret_aleatoire_de_32_caracteres_minimum (ex: produit via openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

> [!WARNING]
> Remplacez `http://localhost:8080` par l'URL réelle de votre instance Keycloak si elle tourne sur un autre port ou dans Docker.

### 3. Adaptation de `auth.config.ts`
Modifiez `auth.config.ts` pour gérer le mapping des rôles depuis le token Keycloak vers la session NextAuth :

```typescript
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;
            const isAdminPage = nextUrl.pathname.startsWith('/admin');
            const isStatsPage = nextUrl.pathname.startsWith('/statistics');

            if (isAdminPage || isStatsPage) {
                if (isLoggedIn) {
                    if (userRole === "ADMIN") return true;
                    return Response.redirect(new URL('/unauthorized', nextUrl));
                }
                return false;
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login') {
                    if (userRole === "ADMIN") {
                        return Response.redirect(new URL('/admin', nextUrl));
                    }
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, profile }) {
            if (user) {
                // Lors de la première connexion
                token.id = user.id;
            }
            if (profile) {
                // Extraction du rôle ADMIN/USER depuis les rôles du Realm Keycloak
                const realmAccess = (profile as any).realm_access;
                const roles = realmAccess?.roles || [];
                token.role = roles.includes("ADMIN") ? "ADMIN" : "USER";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role || "USER";
                (session.user as any).id = (token as any).id as string;
            }
            return session;
        },
    },
    providers: [], // Sera enrichi dans auth.ts
} satisfies NextAuthConfig;
```

### 4. Adaptation de `auth.ts`
Configurez le fournisseur Keycloak dans `auth.ts` :

```typescript
import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Keycloak({
            clientId: process.env.AUTH_KEYCLOAK_ID,
            clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
            issuer: process.env.AUTH_KEYCLOAK_ISSUER,
            // Optionnel : Mapper le profil retourné par Keycloak
            profile(profile) {
                const realmAccess = (profile as any).realm_access;
                const roles = realmAccess?.roles || [];
                return {
                    id: profile.sub,
                    name: profile.name ?? profile.preferred_username,
                    email: profile.email,
                    image: profile.picture,
                    role: roles.includes("ADMIN") ? "ADMIN" : "USER",
                }
            }
        }),
    ],
})
```

---

## 🧪 Partie 3 : Test & Validation de l'intégration

1. Lancez Keycloak et votre serveur de développement Next.js :
   ```bash
   npm run dev
   ```
2. Accédez à l'application sur `http://localhost:3000`.
3. Cliquez sur **Se connecter** : vous devriez être redirigé vers la page de login premium Keycloak.
4. Connectez-vous avec un utilisateur Keycloak ayant le rôle `ADMIN` pour valider l'accès au tableau de bord d'administration.
5. Déconnectez-vous et essayez avec un utilisateur ayant uniquement le rôle `USER` pour valider la redirection automatique vers la page `/unauthorized`.
