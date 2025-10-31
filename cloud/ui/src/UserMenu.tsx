// src/UserMenu.tsx - Componente de menu de usuário com dropdown

import React, { useState, useRef, useEffect } from "react";

interface UserMenuProps {
  userName: string;
  userEmail?: string;
  userPicture?: string;
  onLogout: () => void;
  onOpenBranding: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userName,
  userEmail,
  userPicture,
  onLogout,
  onOpenBranding,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleBranding = () => {
    setIsOpen(false);
    onOpenBranding();
  };

  // Obter iniciais do nome para avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
        type="button"
        id="userMenuDropdown"
        data-bs-toggle="dropdown"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        style={{ minWidth: "120px" }}
      >
        {/* Avatar */}
        <div className="me-2">
          {userPicture ? (
            <img
              src={userPicture}
              alt={userName}
              className="rounded-circle"
              style={{ width: "24px", height: "24px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{
                width: "24px",
                height: "24px",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              {getInitials(userName)}
            </div>
          )}
        </div>

        {/* Nome do usuário */}
        <span
          className="d-none d-sm-inline text-truncate"
          style={{ maxWidth: "80px" }}
        >
          {userName}
        </span>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <ul
          className="dropdown-menu dropdown-menu-end show"
          aria-labelledby="userMenuDropdown"
          style={{ minWidth: "200px" }}
        >
          {/* Header com informações do usuário */}
          <li className="dropdown-header">
            <div className="d-flex align-items-center">
              {userPicture ? (
                <img
                  src={userPicture}
                  alt={userName}
                  className="rounded-circle me-2"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getInitials(userName)}
                </div>
              )}
              <div>
                <div className="fw-bold">{userName}</div>
                {userEmail && <small className="text-muted">{userEmail}</small>}
              </div>
            </div>
          </li>

          <li>
            <hr className="dropdown-divider" />
          </li>

          {/* Item Branding */}
          <li>
            <button
              className="dropdown-item d-flex align-items-center"
              onClick={handleBranding}
            >
              <i className="bi bi-sliders me-2"></i>
              Branding
            </button>
          </li>

          {/* Item Logout */}
          <li>
            <button
              className="dropdown-item d-flex align-items-center text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default UserMenu;
