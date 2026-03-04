import React from 'react';

interface ChapterHeaderProps {
  protagonistName: string;
  title: string;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  protagonistName,
  title,
}) => {
  return (
    <h3 className="font-semibold text-gray-900 mb-4">
      {protagonistName} : {title}
    </h3>
  );
};
