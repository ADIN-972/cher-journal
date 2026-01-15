import React from "react";
import type { User } from "@cher-journal/types";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div
      className={` rounded-xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition ${user.status === "ACTIVE" ? "bg-white" : "bg-rose-100 dashed border-4 border-rose-200"}`}
      onClick={onClick}
      title={user.email}>
      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-2">
        {user.firstName?.[0] || user.email[0]}
      </div>
      <div className="font-semibold text-lg text-center">
        {user.firstName} {user.lastName}
      </div>
      <div className="text-xs text-gray-500 text-center mb-1">{user.email}</div>
      <div className="flex gap-2 mt-2">
        <span
          className={`px-2 py-0.5 text-xs rounded ${user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {user.status === "ACTIVE" ? "Actif" : "Suspendu"}
        </span>
        <span
          className={`px-2 py-0.5 text-xs rounded ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
          {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
      </div>
    </div>
  );
}
