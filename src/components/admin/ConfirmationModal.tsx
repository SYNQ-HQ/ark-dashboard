"use client";

import Modal from "@/components/ui/Modal";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm w-full p-6">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {message}
            </p>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg text-white transition-all shadow-sm hover:brightness-110 disabled:opacity-50 ${variant === 'danger' ? 'bg-red-500' :
                            variant === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                >
                    {isLoading ? 'Processing...' : confirmText}
                </button>
            </div>
        </Modal>
    );
}
