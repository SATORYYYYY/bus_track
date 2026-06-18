import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import { Form } from 'react-bootstrap';

const CityInput = ({ value, onChange, placeholder, label, id }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');
  const [allCities, setAllCities] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Загружаем все города один раз при монтировании
  useEffect(() => {
    const fetchAllCities = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/buses/cities/autocomplete/', {
          params: { q: '' }
        });
        setAllCities(response.data);
      } catch (error) {
        console.error('Ошибка загрузки городов:', error);
      }
    };
    fetchAllCities();
  }, []);

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    
    if (!inputValue) {
      // Если поле пустое — показываем все города
      setSuggestions(allCities);
      return;
    }

    // Фильтруем по введенному тексту
    const filtered = allCities.filter(city => 
      city.name.toLowerCase().includes(inputValue)
    );
    
    // Сортируем: сначала те, что начинаются с запроса
    filtered.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(inputValue);
      const bStarts = b.name.toLowerCase().startsWith(inputValue);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

    setSuggestions(filtered);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    getSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    // Не очищаем подсказки, если поле в фокусе
    if (!isFocused) {
      setSuggestions([]);
    }
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

  const handleFocus = () => {
    setIsFocused(true);
    // При фокусе показываем все города
    setSuggestions(allCities);
  };

  const handleBlur = () => {
    // Задержка, чтобы успел сработать клик по предложению
    setTimeout(() => {
      setIsFocused(false);
      setSuggestions([]);
    }, 200);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const inputProps = {
    placeholder,
    value: inputValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
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
        alwaysRenderSuggestions={isFocused}
      />
    </Form.Group>
  );
};

export default CityInput;
