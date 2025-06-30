import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to the search results page with the query as a URL parameter
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <p className="footer-text">© {new Date().getFullYear()} [Kirlian]. All Rights Reserved.</p>
      </div>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="Buscar posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="footer-search-input"
        />
      </form>
    </footer>
  );
};

export default Footer;