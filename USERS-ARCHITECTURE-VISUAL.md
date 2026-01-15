# 🏗️ Architecture Visuelle - Gestion des Utilisateurs

## Flux de Navigation

```
                         Admin Dashboard
                              │
                              │ (Navigate)
                              ▼
                    ┌─────────────────┐
                    │   Users Page    │
                    │  (Liste tous)   │
                    └────────┬────────┘
                             │
                    (Click "Détails")
                             │
                             ▼
                    ┌─────────────────┐
                    │ UserDetail Page │
                    │  (4 Onglets)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         Overview      Entitlements    Orders
              │              │              │
              │      (Click + Ajouter)     │
              │              │              │
              │              ▼              │
              │    ┌─────────────────────┐  │
              │    │AddEntitlementModal  │  │
              │    │  (Sélectionner)     │  │
              │    └──────────┬──────────┘  │
              │               │             │
              │         (Submit POST)       │
              │               │             │
              │               ▼             │
              │         Backend API         │
              │        (Create/Delete)      │
              │               │             │
              └───────────────┼─────────────┘
                              │
                              ▼
                     (Reload & Toast)
```

## Arborescence des Composants

```
App.tsx (Routes)
│
├─ Layout
│  ├─ Navbar
│  ├─ Sidebar
│  └─ Main Content
│     │
│     ├─ Users.tsx (Page)
│     │  └─ user.map()
│     │     └─ table row + [Détails] button
│     │
│     └─ UserDetail.tsx (Page)
│        ├─ Header (Avatar + Info)
│        ├─ Tabs Navigation
│        │  ├─ Overview Tab
│        │  │  ├─ Stats Cards
│        │  │  └─ Account Info
│        │  │
│        │  ├─ Entitlements Tab
│        │  │  ├─ [Ajouter un accès] button
│        │  │  └─ entitlements.map()
│        │  │     └─ table + [Révoquer] button
│        │  │
│        │  ├─ Orders Tab
│        │  │  └─ orders.map()
│        │  │     └─ order item
│        │  │
│        │  └─ Sessions Tab
│        │     └─ sessions.map()
│        │        └─ session card + [Révoquer] button
│        │
│        └─ Modals
│           └─ AddEntitlementModal
│              ├─ Chapter Select
│              ├─ Volume Inputs
│              ├─ Scope Select
│              ├─ Source Select
│              └─ [Annuler] [Ajouter] buttons
```

## Architecture Backend

```
HTTP Request
    │
    ▼
FastifyInstance (users.routes.ts)
    │
    ├─ POST /admin/users/:id/entitlements
    │  └─ [requireAdmin middleware]
    │     └─ UsersController.addEntitlement()
    │        │
    │        ├─ Zod Schema Validation
    │        │
    │        └─ UsersService.addEntitlement()
    │           ├─ Check user exists
    │           ├─ Check chapter exists
    │           ├─ Validate volumes
    │           │
    │           └─ Prisma.entitlement.create()
    │              └─ Database
    │
    ├─ DELETE /admin/users/:id/entitlements/:entitlementId
    │  └─ [requireAdmin middleware]
    │     └─ UsersController.removeEntitlement()
    │        │
    │        └─ UsersService.removeEntitlement()
    │           ├─ Check ownership
    │           │
    │           └─ Prisma.entitlement.delete()
    │              └─ Database
    │
    └─ DELETE /admin/users/:id/sessions/:sessionId
       └─ [requireAdmin middleware]
          └─ UsersController.revokeSession()
             │
             └─ UsersService.revokeSession()
                ├─ Check ownership
                │
                └─ Prisma.session.delete()
                   └─ Database

HTTP Response (JSON)
```

## Modèle de Données - Relation Users

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id: UUID            │◄─────────┐
│ email: String       │          │
│ status: enum        │          │
│ role: enum          │          │ 1
│ publicId: String    │          │
│ createdAt: DateTime │          │
└─────────────────────┘          │
         │                        │
         │ 1:N                    │
         ├─────────────────────┐  │
         │                     │  │
         ▼                     ▼  │
    ┌──────────┐         ┌──────────────┐
    │ Session  │         │ Entitlement  │
    ├──────────┤         ├──────────────┤
    │ id: UUID │         │ id: UUID     │
    │ userId:* │         │ userId:*─────┼──(via FK)
    │ token    │         │ chapterId:*  │
    │ expiresAt│         │ volumeFrom   │
    │ createdAt│         │ volumeTo     │
    └──────────┘         │ scope: enum  │
                         │ source: enum │
         │               │ grantedAt    │
    [Revoke]     ┌───────┼──────────────┤
    DELETE        │       │ chapter: FK  │
                  │       └──────────────┘
                  │            │
                  │      [Revoke]
                  │      [Edit]
                  │      DELETE
                  │
                  └─ Affichage
                     dans UserDetail
```

## Flux d'État Frontend (UserDetail)

```
Component Init
    │
    ├─ useState(loading = true)
    ├─ useState(user = null)
    ├─ useState(activeTab = "overview")
    ├─ useState(showAddEntitlementModal = false)
    │
    └─ useEffect()
       └─ loadUser()
          │
          ├─ api.get("/admin/users/:id")
          │
          ├─ setUser(response.data)
          │
          └─ setLoading(false)

User Interactions
    │
    ├─ [Suspendre] / [Activer]
    │  └─ handleToggleStatus()
    │     ├─ api.patch("/admin/users/:id", {status})
    │     ├─ toast.success()
    │     └─ loadUser() [reload]
    │
    ├─ [Promouvoir Admin] / [Rétrograder]
    │  └─ handleToggleRole()
    │     ├─ api.patch("/admin/users/:id", {role})
    │     ├─ toast.success()
    │     └─ loadUser() [reload]
    │
    ├─ [Ajouter un accès] (Entitlements Tab)
    │  └─ setShowAddEntitlementModal(true)
    │     └─ Modal Renders
    │
    ├─ [Révoquer] Entitlement
    │  └─ handleRevokeEntitlement()
    │     ├─ confirm()
    │     ├─ api.delete("/admin/users/:id/entitlements/:id")
    │     ├─ toast.success()
    │     └─ loadUser() [reload]
    │
    └─ [Révoquer] Session
       └─ handleRevokeSession()
          ├─ confirm()
          ├─ api.delete("/admin/users/:id/sessions/:id")
          ├─ toast.success()
          └─ loadUser() [reload]
```

## Cycle de Validation (Entitlement Creation)

```
Frontend (AddEntitlementModal)
    │
    ├─ User input values
    │
    └─ onSubmit()
       │
       ├─ Client Validation (Browser)
       │  └─ required fields check
       │
       └─ POST /admin/users/:id/entitlements
          └─ JSON body: {chapterId, volumeFrom, volumeTo, scope, source}
             │
             Backend
             │
             ├─ Zod Schema Validation
             │  ├─ chapterId: UUID format
             │  ├─ volumeFrom: int >= 1
             │  ├─ volumeTo: int >= 1
             │  ├─ scope: "BASE" | "ALL"
             │  └─ source: enum check
             │
             ├─ [PASS] → Service Logic
             │  │
             │  ├─ User exists? (DB query)
             │  ├─ Chapter exists? (DB query)
             │  ├─ volumeTo >= volumeFrom? (Logic check)
             │  │
             │  └─ [ALL PASS]
             │     │
             │     ├─ Create Entitlement (INSERT)
             │     └─ Return 200 + data
             │
             └─ [FAIL] → Error Response
                ├─ 400 VALIDATION_ERROR
                ├─ 404 USER_NOT_FOUND
                ├─ 404 CHAPTER_NOT_FOUND
                └─ 400 INVALID_VOLUME_RANGE

Frontend (Response Handler)
    │
    ├─ [SUCCESS]
    │  ├─ toast.success("Accès ajouté")
    │  ├─ setShowAddEntitlementModal(false)
    │  └─ loadUser() [refresh]
    │
    └─ [ERROR]
       └─ toast.error(error.message)
```

## Sécurité - Couches de Protection

```
HTTP Request
    │
    ▼
Fastify Router
    │
    ├─ requireAdmin Middleware
    │  │
    │  ├─ Check session exists?
    │  ├─ Check user.role === "ADMIN"?
    │  │
    │  └─ [FAIL] → 403 Forbidden
    │     └─ No access to route
    │
    ▼
Controller
    │
    ├─ Zod Validation
    │  ├─ Type checking
    │  ├─ Range validation
    │  ├─ Enum validation
    │  │
    │  └─ [FAIL] → 400 Validation Error
    │
    ▼
Service
    │
    ├─ Business Logic Checks
    │  ├─ Resource Existence
    │  ├─ Ownership Verification
    │  │
    │  └─ [FAIL] → 404 Not Found / 403 Forbidden
    │
    ├─ Prisma Query
    │  ├─ Parameterized query (No SQL injection)
    │  ├─ Foreign key constraints
    │  │
    │  └─ [FAIL] → Database error
    │
    ▼
200 OK + Data
```

## Traductions - Arborescence i18n

```
locales/
├─ fr/
│  └─ common.json
│     │
│     └─ users: {
│           title: "Utilisateurs"
│           email: "Email"
│           created_at: "Créé le"
│           status: "Statut"
│           actions: "Actions"
│           no_users: "Aucun utilisateur..."
│           status_active: "Actif"
│           status_suspended: "Suspendu"
│           role_admin: "Admin"
│           role_user: "Utilisateur"
│           user_details: "Détails..."
│           back_to_users: "Retour..."
│           account_info: "Informations..."
│           public_id: "ID Public"
│           internal_id: "ID Interne"
│           registered_on: "Inscrit le"
│           promote_admin: "Promouvoir Admin"
│           demote_user: "Rétrograder"
│           overview: "Vue d'ensemble"
│           entitlements: "Droits d'accès"
│           add_entitlement: "Ajouter un accès"
│           no_entitlements: "Aucun droit..."
│           revoke: "Révoquer"
│           ...etc
│        }
└─ en/
   └─ common.json
      (À ajouter si besoins)
```

## Colorisation Visuelle (UI States)

```
Status Badges:
  ACTIVE    → bg-green-100, text-green-800
  SUSPENDED → bg-red-100,   text-red-800

Role Badges:
  ADMIN → bg-purple-100, text-purple-800
  USER  → bg-blue-100,   text-blue-800

Scope Badges:
  BASE → bg-blue-100,   text-blue-800
  ALL  → bg-purple-100, text-purple-800

Order Status Badges:
  PAID     → bg-green-100,  text-green-800
  PENDING  → bg-yellow-100, text-yellow-800
  REFUNDED → bg-red-100,    text-red-800

Button States:
  Primary   → bg-indigo-600  hover:bg-indigo-700
  Danger    → bg-red-600     hover:bg-red-700
  Secondary → bg-gray-100    hover:bg-gray-200
  Disabled  → opacity-50     cursor-not-allowed
```

---

## Résumé Structurel

```
FRONTEND                          BACKEND                    DATABASE
┌──────────────────┐             ┌─────────────────┐         ┌────────┐
│ Users Page       │ ──select──→ │ users.routes.ts │         │        │
└──────────────────┘             ├─────────────────┤         │ Prisma│
         │                        │ users.controller│         │        │
         │ navigate/:id           ├─────────────────┤         │ ORM   │
         │                        │ users.service   │         │        │
         ▼                        ├─────────────────┤         │        │
┌──────────────────┐             │ users.schemas   │         │ Users │
│ UserDetail Page  │             └─────────────────┘         │        │
│ - Overview       │             ┌─────────────────┐         │ Orders│
│ - Entitlements   │ ←POST/DEL→ │ HTTP Endpoints  │         │        │
│ - Orders         │             │ (3 nouveaux)    │         │ Sess- │
│ - Sessions       │             └─────────────────┘         │ ions  │
└──────────────────┘                                          │        │
         │                                                    │ Entit-│
         │ modal                                              │ lements│
         ▼                                                    └────────┘
┌──────────────────┐
│ AddEntitle       │
│ mentModal        │
│ - Chapter        │
│ - Volumes        │
│ - Scope          │
│ - Source         │
└──────────────────┘
```

---

**Total: 2 Pages + 1 Modal + 4 Routes Backend = Complete User Management System ✅**
