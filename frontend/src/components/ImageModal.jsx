import React, { useEffect } from 'react';

const ImageModal = ({ isOpen, imageSrc, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Previne scroll da página
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="modal show" onClick={onClose}>
      <img 
        src={imageSrc} 
        className="modal-content" 
        alt="Imagem expandida"
        onClick={(e) => e.stopPropagation()} // Previne que o clique na imagem feche o modal
      />
    </div>
  );
};

export default ImageModal; 