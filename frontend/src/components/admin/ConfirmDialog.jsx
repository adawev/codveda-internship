import React from "react";
import Modal from "./Modal";
import { Button } from "../ui/button";

const ConfirmDialog = ({ open, title, description, confirmLabel = "Confirm", busy = false, onCancel, onConfirm }) => {
  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
