// components/CustomSelect.tsx
import React from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  onChange: (selected: SingleValue<Option>) => void;
}

const customStyles: StylesConfig<Option, false> = {
  control: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    padding: '0.5rem',
    border: '1px solid #ccc',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #aaa',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#2563eb'
      : state.isFocused
      ? '#eff6ff'
      : '#fff',
    color: state.isSelected ? '#fff' : '#000',
    padding: '0.75rem',
    cursor: 'pointer',
  }),
};

const CustomSelect: React.FC<CustomSelectProps> = ({ options, onChange }) => {
  return (
    <Select
      options={options}
      styles={customStyles}
      onChange={onChange}
      placeholder="Select an option"
      isSearchable
    />
  );
};

export default CustomSelect;
