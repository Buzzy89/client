import React, { useState } from 'react';
import { TextField, Box, Chip, Autocomplete } from '@mui/material';

interface WikiDataLabel {
  qid: string;
  title: string;
  description: string;
}

interface WikiDataSearchProps {
  selectedLabels: WikiDataLabel[];
  onLabelsChange: (labels: WikiDataLabel[]) => void;
}

interface WikiDataResult {
  id: string;
  label: string;
  description: string;
}

export const WikiDataSearch: React.FC<WikiDataSearchProps> = ({ selectedLabels, onLabelsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<WikiDataLabel[]>([]);

  const searchWikiData = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&format=json&origin=*`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.search.map((item: any) => ({
        qid: item.id,
        title: item.label,
        description: item.description || ''
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error searching WikiData:', error);
      setSuggestions([]);
    }
  };

  const handleDelete = (labelToDelete: WikiDataLabel) => {
    onLabelsChange(selectedLabels.filter(label => label.qid !== labelToDelete.qid));
  };

  const handleSearch = async (value: string): Promise<WikiDataResult[]> => {
    if (!value.trim()) {
      return [];
    }

    try {
      const response = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${value}&language=en&format=json&origin=*`
      );
      const data = await response.json();
      
      return data.search.map((item: any) => ({
        id: item.id,
        label: item.label,
        description: item.description || ''
      }));
    } catch (error) {
      console.error('Error searching WikiData:', error);
      return [];
    }
  };

  return (
    <Box>
      <Autocomplete
        options={suggestions}
        getOptionLabel={(option) => option.title}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search WikiData"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchWikiData(e.target.value);
            }}
            fullWidth
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
        )}
        onChange={(_, value) => {
          if (value && !selectedLabels.find(label => label.qid === value.qid)) {
            onLabelsChange([...selectedLabels, value]);
          }
        }}
        value={null}
        sx={{
          '& .MuiAutocomplete-listbox': {
            backgroundColor: '#1f2937',
            color: 'white',
          },
          '& .MuiAutocomplete-option': {
            '&:hover': {
              backgroundColor: '#374151',
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {selectedLabels.map((label) => (
          <Chip
            key={label.qid}
            label={`${label.title} - ${label.description}`}
            onDelete={() => handleDelete(label)}
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