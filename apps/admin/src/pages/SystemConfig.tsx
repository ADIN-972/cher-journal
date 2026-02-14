import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import {
  MdSettings,
  MdPayment,
  MdEmail,
  MdPublic,
  MdAutoStories,
  MdRefresh,
  MdSave,
  MdEdit,
  MdVisibility,
  MdVisibilityOff,
  MdCollections,
} from 'react-icons/md';

interface SystemConfig {
  id: string;
  key: string;
  value: string | null;
  category: string;
  type: string;
  description?: string;
  isEncrypted: boolean;
  updatedAt: string;
}

interface ConfigsByCategory {
  [category: string]: SystemConfig[];
}

interface Chapter {
  id: string;
  title: string;
  protagonistName: string;
}

export default function SystemConfig() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    loadConfigs();
    loadChapters();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config');
      if (response.success) {
        setConfigs(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load configs:', error);
      toast.error('Erreur lors du chargement des configurations');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      setLoadingChapters(true);
      const response = await api.get('/admin/chapters');
      if (response.success) {
        setChapters(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load chapters:', error);
      // Don't show error toast for chapters as it's optional
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleInitialize = async () => {
    try {
      const response = await api.post('/admin/config/initialize', {});
      if (response.success) {
        toast.success('Configurations initialisées avec succès');
        loadConfigs();
      }
    } catch (error: any) {
      console.error('Failed to initialize configs:', error);
      toast.error('Erreur lors de l\'initialisation');
    }
  };

  const handleEdit = (config: SystemConfig) => {
    setEditingKey(config.key);
    setEditValue(config.value || '');
  };

  const handleSave = async (key: string) => {
    try {
      const response = await api.put('/admin/config', {
        key,
        value: editValue,
      });

      if (response.success) {
        toast.success('Configuration mise à jour');
        setEditingKey(null);
        loadConfigs();
      }
    } catch (error: any) {
      console.error('Failed to update config:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const configsByCategory: ConfigsByCategory = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as ConfigsByCategory);

  const categories = Object.keys(configsByCategory);
  const filteredConfigs = selectedCategory === 'ALL'
    ? configs
    : configs.filter(c => c.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PAYMENT':
        return <MdPayment className="w-5 h-5" />;
      case 'EMAIL':
        return <MdEmail className="w-5 h-5" />;
      case 'GENERAL':
        return <MdPublic className="w-5 h-5" />;
      case 'READER':
        return <MdAutoStories className="w-5 h-5" />;
      case 'CONTENT':
        return <MdCollections className="w-5 h-5" />;
      default:
        return <MdSettings className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PAYMENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GENERAL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'READER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONTENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MdSettings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration Système</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gérez les paramètres globaux de la plateforme
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInitialize}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <MdRefresh className="w-5 h-5" />
              Initialiser les configs
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({configs.length})
            </button>
            {categories.map(category => (
              <button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)}
                {category} ({configsByCategory[category].length})
              </button>
            ))}
          </div>
        </div>

        {/* Configs list */}
        <div className=" grid grid-cols-2 gap-6">
          {filteredConfigs.map(config => (
            <div
              key={config.key}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(config.category)}`}>
                      {config.category}
                    </span>
                    <code className="text-sm font-mono text-gray-700">{config.key}</code>
                    {config.type === 'SECRET' && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                        SECRET
                      </span>
                    )}
                  </div>
                  {config.description && (
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  )}

                  {/* Value display/edit */}
                  {editingKey === config.key ? (
                    <div className="flex items-center gap-2">
                      {config.key === 'content.moment_selection_chapter_id' ? (
                        <select
                          value={editValue || ''}
                          onChange={(e) => setEditValue(e.target.value)}
                          aria-label="Sélectionner un chapitre pour la sélection du moment"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">-- Aucun chapitre (désactiver la sélection) --</option>
                          {loadingChapters ? (
                            <option disabled>Chargement des chapitres...</option>
                          ) : (
                            chapters.map(chapter => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.title} ({chapter.protagonistName})
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <input
                          type={config.type === 'SECRET' ? 'password' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Nouvelle valeur pour ${config.key}`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleSave(config.key)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <MdSave className="w-5 h-5" />
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        {config.type === 'SECRET' && config.value ? (
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                              {showSecrets[config.key] ? config.value : '••••••••'}
                            </code>
                            <button
                              type="button"
                              onClick={() => toggleSecretVisibility(config.key)}
                              title={showSecrets[config.key] ? 'Masquer la valeur' : 'Afficher la valeur'}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {showSecrets[config.key] ? (
                                <MdVisibilityOff className="w-5 h-5 text-gray-600" />
                              ) : (
                                <MdVisibility className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {config.value || <span className="text-gray-400 italic">Non défini</span>}
                          </code>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Type: {config.type}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Dernière mise à jour: {new Date(config.updatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                {editingKey !== config.key && (
                  <button
                    type="button"
                    onClick={() => handleEdit(config)}
                    title="Éditer cette configuration"
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MdEdit className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredConfigs.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <MdSettings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune configuration trouvée</p>
              <button
                type="button"
                onClick={handleInitialize}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Initialiser les configurations par défaut
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
