import React from "react";

export interface HistoryTimelineNode {
  label: string;
  date: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

interface HistoryTimelineProps {
  nodes: HistoryTimelineNode[];
}

export default function HistoryTimeline({ nodes }: HistoryTimelineProps) {
  return (
    <ol className="relative border-s border-gray-300 w-full bg-white p-4 mx-4">
      {nodes.map((node, idx) => (
        <li
          className="mb-10 ms-6"
          key={idx}>
          <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white">
            {/* Icône calendrier stylisée */}
            <svg
              className="w-3 h-3 text-blue-700"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
              />
            </svg>
          </span>
          <time className="bg-gray-100 border border-gray-300 text-gray-700 text-xs font-medium px-1.5 py-0.5 rounded">
            {node.date}
          </time>
          <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 my-2">
            {node.label}
          </h3>
          <div className="mb-4 text-gray-700 text-sm">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-rose-700 font-bold">
                <span className="block text-xs  mb-1  font-bold">Avant</span>
                <pre className="bg-gray-50 border rounded p-2 text-xs text-rose-700 overflow-x-auto">
                  {node.before ? JSON.stringify(node.before, null, 2) : "-"}
                </pre>
              </div>
              <div className="text-green-700 font-bold">
                <span className="block text-xs  mb-1">Après</span>
                <pre className="bg-gray-50 border rounded p-2 text-xs text-green-700 overflow-x-auto">
                  {node.after ? JSON.stringify(node.after, null, 2) : "-"}
                </pre>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
