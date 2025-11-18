# Funcionalidad de Selección de Usuarios

## Descripción General

Se ha implementado una ventana de decisión que aparece cuando una búsqueda retorna **múltiples resultados**. Esto permite al usuario seleccionar el usuario correcto de forma clara y visual.

## Comportamiento

### Búsqueda con un solo resultado
- El sistema va **directamente** a la vista de detalles del usuario
- Muestra toast: "Usuario encontrado"

### Búsqueda con múltiples resultados
- Abre un **diálogo modal** con todas las coincidencias
- Muestra toast: "Se encontraron X usuarios"
- El usuario debe **seleccionar** uno para continuar

### Búsqueda sin resultados
- Muestra toast de error: "No se encontró ningún usuario con esos datos"
- Permanece en la vista de búsqueda

## Componente UserSelectionDialog

### Ubicación
```
src/components/UserSelectionDialog.tsx
```

### Props
```typescript
interface UserSelectionDialogProps {
  open: boolean;                                    // Controla si el diálogo está abierto
  onClose: () => void;                              // Callback cuando se cierra el diálogo
  onSelect: (user: Student | Teacher | Administrative) => void; // Callback al seleccionar usuario
  users: (Student | Teacher | Administrative)[];    // Array de usuarios a mostrar
  profileType: ProfileType;                         // Tipo de perfil ('student' | 'teacher' | 'administrative')
}
```

### Diseño Visual

#### Header
- **Título**: "X resultado(s) en esta búsqueda"
- **Descripción**: "Seleccione el usuario con el que desea realizar la corrección"

#### Tarjetas de Usuario
Cada tarjeta muestra:
- **Ícono** según tipo de perfil:
  - 🎓 `GraduationCap` para estudiantes
  - 👤 `User` para docentes
  - 💼 `Briefcase` para administrativos
  
- **Nombre completo** (texto grande, bold)
- **Badge** con el tipo de perfil
- **Matrícula/Clave** según el tipo
- **Carrera/Grado** que imparte
- **Teléfono** (si está disponible)
- **Flecha derecha** (→) para indicar clickeabilidad

#### Estados Interactivos
```css
/* Estado normal */
border: 2px border-border

/* Estado hover */
background: bg-accent
shadow: shadow-md
border: border-primary/50 (borde azul semitransparente)
```

#### Footer
- Botón "Cancelar" que regresa a la búsqueda

### Colores Utilizados

```css
/* DIÁLOGO */
--background: hsl(0 0% 100%)           /* Fondo blanco */
--foreground: hsl(222.2 84% 4.9%)     /* Texto principal */
--muted-foreground: hsl(215.4 16.3% 46.9%) /* Texto secundario */
--border: hsl(214.3 31.8% 91.4%)      /* Bordes */
--primary: hsl(218 54% 31%)           /* Azul CUH (íconos, hover) */
--accent: hsl(210 40% 96.1%)          /* Fondo hover */

/* TARJETAS */
Card normal: bg-card border-border
Card hover: bg-accent border-primary/50 shadow-md
```

### Dimensiones

```css
/* DIÁLOGO */
max-width: 48rem (768px)
max-height: 80vh
overflow-y: auto

/* TARJETAS */
padding: 1rem (16px)
gap: 0.75rem (12px) entre tarjetas
border: 2px

/* TEXTOS */
Título: text-2xl (1.5rem / 24px) font-semibold
Nombre usuario: text-lg (1.125rem / 18px) font-semibold
Datos: text-sm (0.875rem / 14px)
```

## Cambios en el Código

### 1. ApiService (`src/services/api.service.ts`)

**Antes:**
```typescript
static async searchStudent(...): Promise<Student | null>
```

**Ahora:**
```typescript
static async searchStudent(...): Promise<Student[]>
```

Todos los métodos de búsqueda ahora retornan **arrays**:
- `searchStudent()` → `Student[]`
- `searchTeacher()` → `Teacher[]`
- `searchAdministrative()` → `Administrative[]`

**Cambios específicos:**
- Retorna `[]` en lugar de `null` cuando no hay resultados
- Mapea **todos** los resultados del API, no solo el primero
- Mantiene logs de debug para los arrays completos

### 2. Index.tsx (`src/pages/Index.tsx`)

#### Estados nuevos
```typescript
const [searchResults, setSearchResults] = useState<UserData[]>([]);
```

#### Vistas nuevas
```typescript
type ViewState = 'profile-selection' | 'search' | 'user-selection' | 'user-details' | 'success';
```

Agregado: `'user-selection'`

#### handleSearch actualizado
```typescript
const handleSearch = async (query, searchType) => {
  let results: UserData[] = [];
  
  // ... llamadas al API ...
  
  if (results.length === 0) {
    // Sin resultados
  } else if (results.length === 1) {
    // Un resultado → vista detalles directamente
  } else {
    // Múltiples resultados → diálogo de selección
    setSearchResults(results);
    setCurrentView('user-selection');
  }
}
```

#### Nuevos handlers
```typescript
// Al seleccionar un usuario del diálogo
const handleUserSelect = (user: UserData) => {
  setUserData(user);
  setSearchResults([]);
  setCurrentView('user-details');
  toast.success('Usuario seleccionado');
};

// Al cancelar la selección
const handleCloseSelection = () => {
  setCurrentView('search');
  setSearchResults([]);
};
```

#### Renderizado del diálogo
```tsx
{currentView === 'user-selection' && selectedProfile && (
  <UserSelectionDialog
    open={true}
    onClose={handleCloseSelection}
    onSelect={handleUserSelect}
    users={searchResults}
    profileType={selectedProfile}
  />
)}
```

## Flujo de Usuario

```
1. Usuario ingresa búsqueda
   ↓
2. Sistema consulta API
   ↓
3a. 0 resultados → Error "No se encontró..."
   ↓ (regresa a búsqueda)

3b. 1 resultado → Toast "Usuario encontrado"
   ↓ (va a detalles directamente)

3c. 2+ resultados → Toast "Se encontraron X usuarios"
   ↓
4. Abre diálogo modal con tarjetas
   ↓
5. Usuario clickea tarjeta o cancela
   ↓
6a. Clickea tarjeta → va a detalles del usuario seleccionado
6b. Clickea cancelar → regresa a búsqueda
```

## Consistencia Visual

### Coherencia con el sistema existente

✅ **Componentes shadcn/ui**: Dialog, Card, Button, Badge
✅ **Colores institucionales**: Azul CUH (`--primary`)
✅ **Tipografía**: Sistema de tamaños existente
✅ **Espaciado**: Escala Tailwind (rem)
✅ **Interactividad**: Hover states consistentes
✅ **Feedback**: Toasts para todas las acciones

### Paleta de colores coherente
- **Primario**: Azul CUH (#1e4a7f) para íconos y hover
- **Texto**: Negro profundo (#0b1120) para contenido principal
- **Texto secundario**: Gris medio (#6c7585) para labels
- **Bordes**: Gris claro (#dde2eb) para separadores
- **Fondo hover**: Gris muy claro (#f3f5f9) para interactividad

## Ejemplo de Uso

```typescript
// En Index.tsx
<UserSelectionDialog
  open={currentView === 'user-selection'}
  onClose={() => {
    setCurrentView('search');
    setSearchResults([]);
  }}
  onSelect={(user) => {
    setUserData(user);
    setCurrentView('user-details');
  }}
  users={searchResults}
  profileType={selectedProfile}
/>
```

## Casos de Prueba

### ✅ Caso 1: Búsqueda por nombre común
**Input**: "Juan Pérez"
**Esperado**: Diálogo con múltiples "Juan Pérez" diferentes
**Resultado**: Usuario selecciona el correcto por matrícula/carrera

### ✅ Caso 2: Búsqueda por matrícula única
**Input**: "98180123"
**Esperado**: Va directo a detalles (solo un resultado)
**Resultado**: Sin diálogo, muestra usuario directamente

### ✅ Caso 3: Búsqueda sin resultados
**Input**: "ZZZ123456"
**Esperado**: Toast de error
**Resultado**: Permanece en búsqueda para reintentar

### ✅ Caso 4: Cancelar selección
**Input**: Usuario abre diálogo → clickea "Cancelar"
**Esperado**: Regresa a búsqueda
**Resultado**: Puede hacer nueva búsqueda

## Accesibilidad

✅ **Dialog**: Modal accesible con overlay
✅ **Keyboard navigation**: Tab entre tarjetas, Enter para seleccionar
✅ **Screen readers**: Labels descriptivos en todos los campos
✅ **Contraste**: WCAG AA cumplido (mínimo 4.5:1)
✅ **Focus visible**: Estados de focus claros

## Notas de Implementación

1. **Sin cambios en el backend**: El API ya retorna arrays, solo se cambia cómo se manejan
2. **Retrocompatible**: Un solo resultado sigue funcionando igual para el usuario final
3. **Performance**: No impacto, misma llamada al API
4. **UX mejorada**: Clara visualización cuando hay ambigüedad

## Actualización de Documentación

Archivos actualizados:
- ✅ `src/services/api.service.ts` - Retorna arrays
- ✅ `src/pages/Index.tsx` - Maneja múltiples resultados
- ✅ `src/components/UserSelectionDialog.tsx` - Componente nuevo

Archivos sin cambios:
- `src/components/SearchForm.tsx` - Sin cambios necesarios
- `src/components/UserDetails.tsx` - Sin cambios necesarios
- `src/types/user.types.ts` - Tipos mantienen compatibilidad
