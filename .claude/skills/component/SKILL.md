# Skill: Component

## Description
Création de composants React pour les applications web et mobile de Cher Journal.

## Usage
```
@component [type] [name] [location]
```

## Types de Composants

### 1. UI Component (Réutilisable)
```
@component ui Button common
```

Génère:
```typescript
// src/components/common/Button.tsx
import { FC, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn font-medium rounded transition';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

### 2. Feature Component (Métier)
```
@component feature ChapterCard chapters
```

Génère:
```typescript
// src/components/features/chapters/ChapterCard.tsx
import { FC } from 'react';
import { Chapter } from '@cher-journal/types';

interface ChapterCardProps {
  chapter: Chapter;
  onSelect: (id: string) => void;
}

/**
 * Carte d'affichage d'un chapitre avec titre, cover, et statut.
 * 
 * @example
 * <ChapterCard 
 *   chapter={chapter} 
 *   onSelect={handleSelect} 
 * />
 */
export const ChapterCard: FC<ChapterCardProps> = ({ chapter, onSelect }) => {
  const handleClick = () => {
    onSelect(chapter.id);
  };

  const statusColors = {
    DRAFT: 'bg-gray-500',
    IN_PROGRESS: 'bg-yellow-500',
    PUBLISHED: 'bg-green-500',
    ARCHIVED: 'bg-red-500'
  };

  return (
    <div
      className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      {chapter.coverAsset && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={`/uploads/${chapter.coverAsset.objectKey}`}
            alt={chapter.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{chapter.title}</h3>
        <p className="text-gray-600 mb-3">{chapter.protagonistName}</p>
        
        <div className="flex items-center justify-between">
          <span className={`badge ${statusColors[chapter.status]}`}>
            {chapter.status}
          </span>
          <span className="text-sm text-gray-500">
            {chapter._count?.volumes || 0} volumes
          </span>
        </div>
      </div>
    </div>
  );
};
```

### 3. Page Component
```
@component page Library pages
```

Génère:
```typescript
// src/pages/Library.tsx
import { FC, useEffect } from 'react';
import { useLibraryStore } from '../store/library';
import { ChapterCard } from '../components/features/chapters/ChapterCard';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useNavigate } from 'react-router-dom';

export const Library: FC = () => {
  const { items, loading, error, fetchLibrary } = useLibraryStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Bibliothèque vide</h2>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas encore de chapitres dans votre bibliothèque.
        </p>
        <button
          onClick={() => navigate('/catalog')}
          className="btn btn-primary"
        >
          Découvrir le catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ma Bibliothèque</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ chapter }) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            onSelect={(id) => navigate(`/chapters/${id}`)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4. Form Component
```
@component form ChapterForm features/chapters
```

Génère:
```typescript
// src/components/features/chapters/ChapterForm.tsx
import { FC, useState } from 'react';
import { z } from 'zod';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';

const chapterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  protagonistName: z.string().min(1, 'Protagonist name is required'),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PUBLISHED'])
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
  initialData?: Partial<ChapterFormData>;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export const ChapterForm: FC<ChapterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save'
}) => {
  const [formData, setFormData] = useState<ChapterFormData>({
    title: initialData?.title || '',
    protagonistName: initialData?.protagonistName || '',
    status: initialData?.status || 'DRAFT'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = <K extends keyof ChapterFormData>(
    field: K,
    value: ChapterFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const result = chapterSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Submit
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : 'Failed to save' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={formData.title}
        onChange={e => handleChange('title', e.target.value)}
        error={errors.title}
        required
      />

      <Input
        label="Protagonist Name"
        value={formData.protagonistName}
        onChange={e => handleChange('protagonistName', e.target.value)}
        error={errors.protagonistName}
        required
      />

      <Select
        label="Status"
        value={formData.status}
        onChange={e => handleChange('status', e.target.value as any)}
        options={[
          { value: 'DRAFT', label: 'Draft' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'PUBLISHED', label: 'Published' }
        ]}
      />

      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

### 5. Modal Component
```
@component modal ChapterModal features/chapters
```

Génère:
```typescript
// src/components/features/chapters/ChapterModal.tsx
import { FC } from 'react';
import { Modal } from '../../common/Modal';
import { ChapterForm } from './ChapterForm';
import type { Chapter } from '@cher-journal/types';

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter?: Chapter;
  onSave: (data: any) => Promise<void>;
}

export const ChapterModal: FC<ChapterModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onSave
}) => {
  const handleSubmit = async (data: any) => {
    await onSave(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={chapter ? 'Edit Chapter' : 'Create Chapter'}
    >
      <ChapterForm
        initialData={chapter}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel={chapter ? 'Update' : 'Create'}
      />
    </Modal>
  );
};
```

## React Native Components

### Mobile Component
```typescript
// apps/mobile/src/components/ChapterCard.tsx
import { FC } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Chapter } from '@cher-journal/types';

interface ChapterCardProps {
  chapter: Chapter;
  onPress: () => void;
}

export const ChapterCard: FC<ChapterCardProps> = ({ chapter, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {chapter.coverAsset && (
        <Image
          source={{ uri: `${API_URL}/uploads/${chapter.coverAsset.objectKey}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.subtitle}>{chapter.protagonistName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{chapter.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
```

## Hooks Personnalisés

```typescript
// src/hooks/useChapters.ts
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Chapter } from '@cher-journal/types';

export const useChapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.chapters.list();
      setChapters(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return { chapters, loading, error, refetch: fetchChapters };
};
```

## Component Checklist

- [ ] TypeScript props interface définie
- [ ] Props documentées (JSDoc)
- [ ] Loading/error states gérés
- [ ] Validation si formulaire
- [ ] Accessible (labels, ARIA)
- [ ] Responsive design
- [ ] Optimisé (memo si nécessaire)
- [ ] Tests unitaires
- [ ] Storybook story (si applicable)

## Best Practices

### ✅ Do
- Props interface avec TypeScript
- Composants purs et réutilisables
- Extraction logique dans hooks
- Memoization si nécessaire
- Gestion erreurs/loading
- Accessibilité (ARIA, labels)
- Documentation JSDoc

### ❌ Don't
- Logic complexe dans composants
- Props drilling excessif
- Mutations directes du state
- Oublier keys dans listes
- Ignorer warnings React
- Composants > 300 lignes
