import { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 w-full rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh] ${className || "max-w-lg"}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
