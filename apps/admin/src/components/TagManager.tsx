import { useState, useEffect } from "react";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdLabel,
  MdClose,
  MdCheck,
} from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";

interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

interface TagManagerProps {
  onTagsChange?: () => void;
}

export default function TagManager({ onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6", // Blue default
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/asset-tags");
      setTags(response.data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des tags");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTag) {
        // Update existing tag
        await api.patch(`/admin/asset-tags/${editingTag.id}`, formData);
        toast.success("Tag modifié avec succès");
      } else {
        // Create new tag
        await api.post("/admin/asset-tags", formData);
        toast.success("Tag créé avec succès");
      }

      setShowForm(false);
      setEditingTag(null);
      setFormData({ name: "", description: "", color: "#3B82F6" });
      await loadTags();
      onTagsChange?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.code === "TAG_ALREADY_EXISTS"
          ? "Un tag avec ce nom existe déjà"
          : "Erreur lors de l'enregistrement du tag";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color || "#3B82F6",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTag) return;

    try {
      await api.delete(`/admin/asset-tags/${deletingTag.id}`);
      toast.success("Tag supprimé avec succès");
      setDeletingTag(null);
      await loadTags();
      onTagsChange?.();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression du tag");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(null);
    setFormData({ name: "", description: "", color: "#3B82F6" });
  };

  const predefinedColors = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#EAB308", // Yellow
    "#84CC16", // Lime
    "#22C55E", // Green
    "#10B981", // Emerald
    "#14B8A6", // Teal
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#A855F7", // Purple
    "#D946EF", // Fuchsia
    "#EC4899", // Pink
    "#F43F5E", // Rose
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Chargement des tags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MdLabel className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gestion des Tags
            </h3>
            <p className="text-sm text-gray-500">
              Organisez vos assets avec des tags colorés
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdAdd className="w-5 h-5" />
          <span>Nouveau Tag</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-gray-900">
            {editingTag ? "Modifier le tag" : "Créer un nouveau tag"}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du tag *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Chapitre 1, Paysage, Brouillon..."
                required
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description du tag..."
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <div className="flex items-center space-x-4">
                {/* Current color preview */}
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />

                {/* Predefined colors */}
                <div className="flex-1 grid grid-cols-8 gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Custom color input */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Custom:</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <MdCheck className="w-5 h-5" />
                <span>{editingTag ? "Enregistrer" : "Créer"}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <MdClose className="w-5 h-5" />
                <span>Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-2">
        {!tags || tags.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MdLabel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun tag créé</p>
            <p className="text-sm text-gray-400 mt-1">
              Créez votre premier tag pour organiser vos assets
            </p>
          </div>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Tag Info */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Color badge */}
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: tag.color || "#3B82F6" }}
                />

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">{tag.name}</h4>
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {tag._count?.assets || 0} asset
                      {(tag._count?.assets || 0) > 1 ? "s" : ""}
                    </span>
                  </div>
                  {tag.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {tag.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier">
                  <MdEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeletingTag(tag)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer">
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer le tag
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le tag{" "}
              <strong>{deletingTag.name}</strong> ?
              {deletingTag._count && deletingTag._count.assets > 0 && (
                <span className="block mt-2 text-sm text-amber-600">
                  ⚠️ Ce tag est utilisé par {deletingTag._count.assets} asset
                  {deletingTag._count.assets > 1 ? "s" : ""}. Il sera retiré de
                  tous ces assets.
                </span>
              )}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Supprimer
              </button>
              <button
                onClick={() => setDeletingTag(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
