// ui/src/ApprovalDemo.tsx
import { useState } from "react";
import { setApprovalStatus, clearApprovalStatus } from "./ApprovalHelper";
import { APPROVAL_STATUS } from "./constants/constants";

export function ApprovalDemo() {
  const [currentStatus, setCurrentStatus] = useState<string>("default");

  const handleStatusChange = (status: keyof typeof APPROVAL_STATUS) => {
    setApprovalStatus(status, `Status alterado para ${status} (demo)`);
    setCurrentStatus(status);
    window.location.reload(); // Reload to see the changes
  };

  const handleClearStatus = () => {
    clearApprovalStatus();
    setCurrentStatus("cleared");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Approval Demo</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleStatusChange("PENDING")}
          className="block w-full px-3 py-1 bg-yellow-500 text-white rounded text-sm"
        >
          Set PENDING
        </button>
        <button
          onClick={() => handleStatusChange("APPROVED")}
          className="block w-full px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Set APPROVED
        </button>
        <button
          onClick={() => handleStatusChange("REJECTED")}
          className="block w-full px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Set REJECTED
        </button>
        <button
          onClick={handleClearStatus}
          className="block w-full px-3 py-1 bg-gray-500 text-white rounded text-sm"
        >
          Clear Status
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Current: {currentStatus}</p>
    </div>
  );
}
