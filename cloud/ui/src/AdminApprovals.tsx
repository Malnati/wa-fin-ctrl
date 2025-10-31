// ui/src/AdminApprovals.tsx

import { useState, useEffect } from "react";
import { APPROVAL_STATUS } from "./constants/constants";

interface UserApproval {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  status: (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];
  approvedAt?: string;
  approvedBy?: string;
}

interface ApprovalStats {
  users: UserApproval[];
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function AdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApprovals();

    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchApprovals, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await fetch("/admin/approvals");
      if (response.ok) {
        const data = await response.json();
        setApprovals(data);
      } else {
        console.error("Failed to fetch approvals");
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/admin/approve/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "admin" }),
      });

      if (response.ok) {
        // Show success message
        const successDiv = document.createElement("div");
        successDiv.className =
          "alert alert-success alert-dismissible fade show position-fixed";
        successDiv.style.top = "20px";
        successDiv.style.right = "20px";
        successDiv.style.zIndex = "9999";
        successDiv.innerHTML = `
          <strong>Sucesso!</strong> Usuário aprovado com sucesso. E-mail de notificação foi enviado.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);

        await fetchApprovals(); // Refresh the list
      } else {
        console.error("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Motivo da rejeição (opcional):");

    try {
      const response = await fetch(`/admin/reject/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedBy: "admin", reason }),
      });

      if (response.ok) {
        // Show success message
        const successDiv = document.createElement("div");
        successDiv.className =
          "alert alert-warning alert-dismissible fade show position-fixed";
        successDiv.style.top = "20px";
        successDiv.style.right = "20px";
        successDiv.style.zIndex = "9999";
        successDiv.innerHTML = `
          <strong>Concluído!</strong> Usuário rejeitado. E-mail de notificação foi enviado.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);

        await fetchApprovals(); // Refresh the list
      } else {
        console.error("Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) {
      // Approve all pending users if no specific selection
      const pendingUserIds =
        approvals?.users
          .filter((user) => user.status === APPROVAL_STATUS.PENDING)
          .map((user) => user.id) || [];

      if (pendingUserIds.length === 0) return;

      try {
        const response = await fetch("/admin/bulk-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userIds: pendingUserIds,
            approvedBy: "admin",
          }),
        });

        if (response.ok) {
          await fetchApprovals(); // Refresh the list
        } else {
          console.error("Failed to bulk approve users");
        }
      } catch (error) {
        console.error("Error bulk approving users:", error);
      }
      return;
    }

    try {
      const response = await fetch("/admin/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          approvedBy: "admin",
        }),
      });

      if (response.ok) {
        setSelectedUsers(new Set());
        setBulkMode(false);
        await fetchApprovals(); // Refresh the list
      } else {
        console.error("Failed to bulk approve users");
      }
    } catch (error) {
      console.error("Error bulk approving users:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando aprovações...</span>
        </div>
      </div>
    );
  }

  if (!approvals) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="alert alert-danger text-center">
          Erro ao carregar aprovações
        </div>
      </div>
    );
  }

  const pendingUsers = approvals.users.filter(
    (user) => user.status === APPROVAL_STATUS.PENDING,
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1">Gerenciamento de usuários</h1>
              <p className="text-muted">
                Gerenciar e aprovar novos registros de usuários
              </p>
            </div>
            <div className="d-flex gap-2">
              {pendingUsers.length > 0 && (
                <>
                  <button
                    onClick={() => setBulkMode(!bulkMode)}
                    className={`btn ${bulkMode ? "btn-secondary" : "btn-outline-primary"}`}
                  >
                    {bulkMode ? "Cancelar" : "Seleção múltipla"}
                  </button>
                  {bulkMode && selectedUsers.size > 0 && (
                    <button
                      onClick={handleBulkApprove}
                      className="btn btn-primary"
                    >
                      Aprovar Selecionados ({selectedUsers.size})
                    </button>
                  )}
                  {!bulkMode && (
                    <button
                      onClick={handleBulkApprove}
                      className="btn btn-primary"
                    >
                      Aprovar Todos
                    </button>
                  )}
                </>
              )}
              <button
                onClick={fetchApprovals}
                className="btn btn-outline-secondary"
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise"></i> Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-primary">{approvals.total}</h3>
              <small className="text-muted">Total de usuários</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-warning">{approvals.pending}</h3>
              <small className="text-muted">Pendentes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-success">{approvals.approved}</h3>
              <small className="text-muted">Aprovados</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="text-danger">{approvals.rejected}</h3>
              <small className="text-muted">Rejeitados</small>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            Solicitações pendentes ({pendingUsers.length})
          </h5>
        </div>
        <div className="card-body">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-4 text-muted">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            <div className="row">
              {pendingUsers.map((user) => (
                <div key={user.id} className="col-md-6 col-lg-4 col-xl-3 mb-3">
                  <div
                    className={`card h-100 ${bulkMode && selectedUsers.has(user.id) ? "border-primary bg-light" : ""}`}
                  >
                    <div className="card-body d-flex flex-column">
                      {bulkMode && (
                        <div className="mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`user-${user.id}`}
                              checked={selectedUsers.has(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`user-${user.id}`}
                            >
                              Selecionar
                            </label>
                          </div>
                        </div>
                      )}
                      <h6 className="card-title">{user.name}</h6>
                      <p className="card-text text-muted small">{user.email}</p>
                      <p className="card-text">
                        <small className="text-muted">
                          Registrado em: {formatDate(user.registeredAt)}
                        </small>
                      </p>

                      {!bulkMode && (
                        <div className="mt-auto d-flex gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="btn btn-success btn-sm flex-fill"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="btn btn-outline-danger btn-sm flex-fill"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
