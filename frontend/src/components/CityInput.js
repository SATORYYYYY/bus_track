import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import { Form } from 'react-bootstrap';

const CityInput = ({ value, onChange, placeholder, label, id }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');

  const getSuggestions = async (value) => {
    const inputValue = value.trim().toLowerCase();
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/buses/cities/autocomplete/', {
        params: { q: inputValue }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Ошибка загрузки городов:', error);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div className="city-suggestion">
      <span className="city-name">{suggestion.name}</span>
      {suggestion.region && (
        <span className="city-region">, {suggestion.region}</span>
      )}
    </div>
  );

  const handleChange = (event, { newValue }) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const inputProps = {
    placeholder,
    value: inputValue,
    onChange: handleChange,
    className: 'form-control',
    id: id,
  };

  return (
    <Form.Group className="mb-3">
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
      />
    </Form.Group>
  );
};

export default CityInput;