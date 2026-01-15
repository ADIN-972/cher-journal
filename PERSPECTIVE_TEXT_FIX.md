# Fix for Perspective Text Display Issue

## Problem
The perspective text was not displaying in the VolumePerspectiverDrawer textarea, even though the API was returning data correctly. This was because:

1. **Security Design**: The backend intentionally **does not return** the `text` field in the normal volume/version endpoints for security reasons
2. **Encrypted Storage**: Text is stored encrypted in the `EncryptedBlob` table, referenced via `textBlobId`
3. **Missing Endpoints**: No dedicated endpoints existed to:
   - Fetch decrypted text for editing (GET)
   - Save encrypted text (PATCH)

## Solution Implemented

### 1. Backend: Created Two New Endpoints

#### GET `/admin/volume-versions/:versionId/text`
- **Purpose**: Fetch the decrypted text for a specific version
- **Location**: [apps/backend/src/modules/admin/volumes/](apps/backend/src/modules/admin/volumes/)
- **Implementation**:
  - Finds the VolumeVersion with textBlob relation
  - If encryption enabled: decrypts the blob using `decryptBlob()`
  - If encryption disabled (dev mode): returns plaintext from `version.text`
  - Returns: `{ success: true, data: { text: "..." } }`
  - Errors:
    - 404 if version not found
    - 404 if no text blob exists (NO_TEXT_BLOB)

```typescript
async getVersionText(versionId: string): Promise<string> {
  const version = await prisma.volumeVersion.findUnique({
    where: { id: versionId },
    include: { textBlob: true },
  });

  if (!version) throw new Error('VERSION_NOT_FOUND');
  
  if (!config.encryptionEnabled && version.text) {
    return version.text;
  }
  
  if (config.encryptionEnabled && version.textBlob) {
    return decryptBlob(version.textBlob);
  }
  
  throw new Error('NO_TEXT_BLOB');
}
```

#### PATCH `/admin/volume-versions/:versionId/text`
- **Purpose**: Save text with encryption
- **Request Body**:
  ```json
  {
    "text": "The full text content",
    "title": "Optional title" // Can be updated alongside text
  }
  ```
- **Implementation**:
  - If encryption enabled: encrypts text with `encrypt()`, stores in EncryptedBlob, updates `textBlobId`
  - If encryption disabled: stores plaintext directly in `text` field
  - Deletes old blob if replacing existing encrypted text
  - Returns updated version with illustrationAsset

### 2. Frontend: Updated VolumePerspectiverDrawer Component

#### Added New Function: `loadPerspectiveText()`
- Calls new GET endpoint to fetch text for current perspective
- Handles 404 gracefully (no text exists yet)
- Updates `perspectiveText` state

```typescript
const loadPerspectiveText = async (versionId: string) => {
  try {
    const response = await api.get(`/admin/volume-versions/${versionId}/text`);
    const text = response.data?.data?.text || '';
    setPerspectiveText(text);
  } catch (error: any) {
    if (error.response?.status === 404) {
      setPerspectiveText('');
    } else {
      toast.error('Erreur lors du chargement du texte');
    }
  }
};
```

#### Modified: `useEffect` for selectedPerspective
- Now calls `loadPerspectiveText()` when switching perspectives
- Fetches text from server instead of trying to use `version.text`

```typescript
useEffect(() => {
  if (selectedPerspective && versions.length > 0) {
    const version = versions.find(v => v.perspective === selectedPerspective);
    if (version) {
      setPerspectiveTitle(version.title || '');
      loadPerspectiveText(version.id); // NEW: Load text from endpoint
    } else {
      setPerspectiveTitle('');
      setPerspectiveText('');
    }
  }
}, [selectedPerspective, versions]);
```

#### Modified: `savePerspectiveDetail()`
- Now uses new PATCH endpoint for text updates
- Endpoint path: `/admin/volume-versions/{versionId}/text`
- Only creates new versions, doesn't try to save text during creation

```typescript
const savePerspectiveDetail = async (perspective: 'NARRATOR' | 'PROTAGONIST') => {
  if (!volume) return;
  const version = versions.find(v => v.perspective === perspective);
  const isPlaceholder = version?.id.startsWith('placeholder-');
  
  try {
    if (version && !isPlaceholder) {
      // Use dedicated /text endpoint for saving text in production
      await api.patch(`/admin/volume-versions/${version.id}/text`, {
        text: perspectiveText || '',
        title: perspectiveTitle || null,
      });
      toast.success('Perspective mise à jour');
    } else {
      // Create a new version
      await api.post(`/admin/volumes/${volume.id}/versions`, {
        perspective,
        title: perspectiveTitle || null,
      });
      toast.success('Perspective créée');
      await loadVersions();
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error('Cette perspective existe déjà pour ce volume');
    } else {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  }
};
```

### 3. Updated Files

**Backend**:
- `apps/backend/src/modules/admin/volumes/volumes.controller.ts` - Added 2 new methods
- `apps/backend/src/modules/admin/volumes/volumes.routes.ts` - Added 2 new route handlers
- `apps/backend/src/modules/admin/volumes/volumes.service.ts` - Added 2 new service methods + imported crypto

**Frontend**:
- `apps/admin/src/components/VolumePerspectiverDrawer.tsx` - Updated to use new endpoints
- `apps/admin/src/pages/ChapterDetail.tsx` - Removed unused `onUpdate` prop

## Data Flow

### Reading Perspective Text
```
User clicks perspective button
       ↓
selectedPerspective changes
       ↓
useEffect triggers loadPerspectiveText(versionId)
       ↓
GET /admin/volume-versions/{versionId}/text
       ↓
Backend decrypts blob (if encryption enabled)
       ↓
Frontend receives decrypted text
       ↓
textarea displays text in perspectiveText state
```

### Saving Perspective Text
```
User edits textarea
       ↓
User clicks "Enregistrer" button
       ↓
savePerspectiveDetail() called
       ↓
PATCH /admin/volume-versions/{versionId}/text
       ↓
Backend encrypts and stores in EncryptedBlob (or plaintext if dev mode)
       ↓
Frontend shows success toast
```

## Security Notes

1. **Text is never sent unencrypted to client** - It's decrypted server-side and sent as plaintext in response
2. **Encryption is transparent** - Frontend doesn't need to know about encryption keys
3. **Dedicated endpoints** - Text access is separated from version metadata access
4. **Blob management** - Old encrypted blobs are deleted when replacing text

## Testing the Fix

1. **Log in** to admin panel (admin@cherjournal.com / admin123)
2. **Navigate** to a chapter with volumes
3. **Open** perspective drawer by clicking on a volume
4. **Switch** between Narrateur and Protagoniste perspectives
   - Textarea should now display text (or be empty if no text exists)
5. **Edit** the text in the textarea
6. **Click** "Enregistrer" button
   - Should see success message
   - Text should persist on refresh

## Configuration

- Encryption mode controlled by `config.encryptionEnabled`
- Master key from `MASTER_ENCRYPTION_KEY` environment variable
- If encryption disabled (dev mode):
  - Text stored directly in `VolumeVersion.text` field
  - No EncryptedBlob used
  - Plain HTTP (not recommended for production)

## Future Enhancements

1. Add title field to endpoint response for consistency
2. Add batch text update endpoint for bulk operations
3. Add text validation/sanitization before encryption
4. Add audit logging for text modifications
