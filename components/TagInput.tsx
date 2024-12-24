import React, { useState } from 'react';
import { Chip, TextField, Box } from '@mui/material';
import { Tag } from '../types';

interface TagInputProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newTag: Tag = {
        name: inputValue.trim()
      };
      onTagsChange([...tags, newTag]);
      setInputValue('');
    }
  };

  const handleDelete = (tagToDelete: string) => {
    onTagsChange(tags.filter(tag => tag.name !== tagToDelete));
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Add Tags"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleSubmit}
        placeholder="Press Enter to add tag"
        margin="normal"
        sx={{
          '& .MuiInputLabel-root': { color: 'rgb(156 163 175)' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgb(75 85 99)' },
            '&:hover fieldset': { borderColor: '#7c3aed' },
            '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
          },
          '& .MuiInputBase-input': { color: 'white' },
        }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {tags.map((tag) => (
          <Chip
            key={tag.id || tag.name}
            label={tag.name}
            onDelete={() => handleDelete(tag.name)}
            sx={{
              backgroundColor: '#7c3aed',
              color: 'white',
              '&:hover': { backgroundColor: '#6d28d9' },
              '& .MuiChip-deleteIcon': {
                color: 'white',
                '&:hover': { color: '#e5e7eb' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}; 