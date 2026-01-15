import { useState } from "react";
import {
  MdClose,
  MdFileUpload,
  MdWarning,
  MdCheckCircle,
} from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";

interface ParsedVolume {
  volumeNumber: number;
  title: string;
  narratorText: string;
  protagonistText: string;
}

interface BulkTextImportModalProps {
  isOpen: boolean;
  chapterId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkTextImportModal({
  isOpen,
  chapterId,
  onClose,
  onSuccess,
}: BulkTextImportModalProps) {
  const [rawText, setRawText] = useState("");
  const [parsedVolumes, setParsedVolumes] = useState<ParsedVolume[]>([]);
  const [step, setStep] = useState<"input" | "preview" | "importing">("input");
  const [importing, setImporting] = useState(false);

  const parseText = () => {
    const volumes: ParsedVolume[] = [];
    const lines = rawText.split("\n");

    let currentVolume: Partial<ParsedVolume> | null = null;
    let currentSection: "title" | "narrator" | "protagonist" | null = null;
    let textBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect volume start: "Vol. X : Title" or "Vol X : Title" (avec ou sans point)
      if (trimmed.match(/^Vol\.?\s*(\d+)\s*:\s*(.+)/i)) {
        // Save previous volume if exists
        if (currentVolume && currentVolume.volumeNumber !== undefined) {
          if (currentSection === "narrator") {
            currentVolume.narratorText = textBuffer.join("\n").trim();
          } else if (currentSection === "protagonist") {
            currentVolume.protagonistText = textBuffer.join("\n").trim();
          }
          volumes.push(currentVolume as ParsedVolume);
        }

        // Start new volume
        const match = trimmed.match(/^Vol\.?\s*(\d+)\s*:\s*(.+)/i);
        currentVolume = {
          volumeNumber: parseInt(match![1]),
          title: match![2].trim(),
          narratorText: "",
          protagonistText: "",
        };
        currentSection = null;
        textBuffer = [];
        continue;
      }

      // Detect separator: "____________________"
      if (trimmed.match(/^_{10,}$/)) {
        if (currentVolume && currentSection === "narrator") {
          currentVolume.narratorText = textBuffer.join("\n").trim();
          textBuffer = [];
          currentSection = null;
        }
        continue;
      }

      // Detect protagonist start: "Femme : " or "Protagoniste : "
      if (trimmed.match(/^(Femme|Protagoniste)\s*:/i)) {
        if (currentVolume) {
          currentSection = "protagonist";
          textBuffer = [];
        }
        continue;
      }

      // Skip chapter title line (first non-empty line before any volume)
      if (!currentVolume && trimmed && !trimmed.match(/^Vol\./i)) {
        continue;
      }

      // Start narrator section after volume title
      if (
        currentVolume &&
        currentVolume.volumeNumber !== undefined &&
        currentSection === null &&
        trimmed
      ) {
        currentSection = "narrator";
      }

      // Accumulate text
      if (currentSection && currentVolume) {
        textBuffer.push(line);
      }
    }

    // Save last volume
    if (currentVolume && currentVolume.volumeNumber !== undefined) {
      if (currentSection === "narrator") {
        currentVolume.narratorText = textBuffer.join("\n").trim();
      } else if (currentSection === "protagonist") {
        currentVolume.protagonistText = textBuffer.join("\n").trim();
      }
      volumes.push(currentVolume as ParsedVolume);
    }

    if (volumes.length === 0) {
      toast.error("Aucun volume détecté. Vérifiez le format du texte.");
      return;
    }

    setParsedVolumes(volumes);
    setStep("preview");
  };

  const importVolumes = async () => {
    setImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const volume of parsedVolumes) {
        try {
          // Import via API endpoint
          await api.post(`/admin/chapters/${chapterId}/bulk-import-volume`, {
            volumeNumber: volume.volumeNumber,
            title: volume.title,
            narratorText: volume.narratorText,
            protagonistText: volume.protagonistText,
          });
          successCount++;
        } catch (error: any) {
          console.error(
            `Error importing volume ${volume.volumeNumber}:`,
            error
          );
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`${successCount} volumes importés avec succès !`);
        onSuccess();
        handleClose();
      } else {
        toast.error(`${successCount} réussis, ${errorCount} échecs`);
      }
    } catch (error) {
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setRawText("");
    setParsedVolumes([]);
    setStep("input");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white">
              <MdFileUpload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Import en masse des textes
              </h2>
              <p className="text-sm text-gray-500">
                {step === "input" && "Collez le texte formaté"}
                {step === "preview" &&
                  `${parsedVolumes.length} volumes détectés`}
                {step === "importing" && "Import en cours..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            title="Fermer">
            <MdClose className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "input" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MdWarning className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">Format attendu :</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          Vol. 1 : Titre du volume
                        </code>{" "}
                        pour commencer un volume
                      </li>
                      <li>
                        Le texte qui suit est automatiquement le narrateur
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          ____________________
                        </code>{" "}
                        (ligne de soulignements) pour séparer
                        narrateur/protagoniste
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 rounded">
                          Femme :{" "}
                        </code>{" "}
                        ou{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          Protagoniste :{" "}
                        </code>{" "}
                        pour commencer le texte protagoniste
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Collez ici le texte complet avec tous les volumes..."
                className="w-full h-[500px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none font-mono text-sm resize-none"
              />
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <MdCheckCircle className="text-green-600 text-2xl" />
                <div>
                  <p className="font-semibold text-green-900">
                    {parsedVolumes.length} volumes détectés
                  </p>
                  <p className="text-sm text-green-700">
                    Vérifiez les données avant l'import
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {parsedVolumes.map((volume) => (
                  <div
                    key={volume.volumeNumber}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {volume.volumeNumber}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {volume.title}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <p className="font-semibold text-blue-900 mb-1">
                          📖 Narrateur
                        </p>
                        <p className="text-blue-700">
                          {volume.narratorText.length} caractères
                        </p>
                        <p className="text-blue-600 truncate mt-1">
                          {volume.narratorText.substring(0, 80)}...
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <p className="font-semibold text-purple-900 mb-1">
                          👤 Protagoniste
                        </p>
                        <p className="text-purple-700">
                          {volume.protagonistText.length} caractères
                        </p>
                        <p className="text-purple-600 truncate mt-1">
                          {volume.protagonistText.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={importing}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50">
            Annuler
          </button>
          <div className="flex gap-3">
            {step === "preview" && (
              <button
                onClick={() => setStep("input")}
                disabled={importing}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50">
                Retour
              </button>
            )}
            {step === "input" && (
              <button
                onClick={parseText}
                disabled={!rawText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Analyser le texte
              </button>
            )}
            {step === "preview" && (
              <button
                onClick={importVolumes}
                disabled={importing}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2">
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <MdFileUpload className="w-5 h-5" />
                    Importer {parsedVolumes.length} volumes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
