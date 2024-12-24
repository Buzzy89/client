import React from 'react'

interface WikiTag {
  id: string;
  label: string;
  description: string;
}

interface WikiTagDropdownProps {
  tags: WikiTag[];
  onSelect: (tag: WikiTag) => void;
}

const WikiTagDropdown: React.FC<WikiTagDropdownProps> = ({ tags, onSelect }) => {
  if (tags.length === 0) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-dark-200 border border-neon-blue rounded-md shadow-lg max-h-60 overflow-auto">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="p-2 hover:bg-dark-300 cursor-pointer"
          onClick={() => onSelect(tag)}
        >
          <div className="font-semibold text-neon-blue">{tag.label}</div>
          <div className="text-sm text-gray-300">{tag.description}</div>
        </div>
      ))}
    </div>
  );
};

export default WikiTagDropdown;

