// Exemple d'utilisation de TableGrid dans Chapters.tsx

import TableGrid, { TableColumn, TableAction } from "../components/TableGrid";
import type { Chapter } from "@cher-journal/types";

// Dans le composant Chapters:

const getStatusBadge = (status: string) => {
  const colors = {
    DRAFT: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
  };
  const labels = {
    DRAFT: "Brouillon",
    IN_PROGRESS: "En cours",
    PUBLISHED: "Publié",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
};

// Définir les colonnes
const columns: TableColumn<Chapter>[] = [
  {
    header: "Titre",
    render: (chapter) => (
      <button
        onClick={() => navigate(`/chapters/${chapter.id}`)}
        className="text-blue-600 hover:text-blue-800 font-medium">
        {chapter.title}
      </button>
    ),
  },
  {
    header: "Protagoniste",
    accessor: "protagonistName",
  },
  {
    header: "Statut",
    render: (chapter) => getStatusBadge(chapter.status),
  },
  {
    header: "Date",
    render: (chapter) =>
      new Date(chapter.createdAt).toLocaleDateString("fr-FR"),
    className: "text-sm text-gray-500",
  },
];

// Définir les actions
const actions: TableAction<Chapter>[] = [
  {
    label: "Détails",
    onClick: (chapter) => navigate(`/chapters/${chapter.id}`),
    className: "text-blue-600 hover:text-blue-800 text-sm font-medium",
  },
  {
    label: "Éditer",
    onClick: openEditModal,
    className: "text-green-600 hover:text-green-800 text-sm font-medium",
  },
  {
    label: "Supprimer",
    onClick: handleDelete,
    className: "text-red-600 hover:text-red-800 text-sm font-medium",
  },
];

// Utilisation dans le JSX:
<TableGrid
  data={chapters}
  columns={columns}
  actions={actions}
  selectable
  selectedIds={selectedChapterIds}
  onToggleSelection={toggleChapterSelection}
  onToggleSelectAll={toggleSelectAll}
  getItemId={(chapter) => chapter.id}
  emptyMessage="Aucun chapitre pour le moment"
  loading={loading}
/>;
