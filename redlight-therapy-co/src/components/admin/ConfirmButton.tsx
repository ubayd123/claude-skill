"use client";

export default function ConfirmButton({ label, message, className = "btn btn-red btn-sm" }: { label: string; message: string; className?: string }) {
  return (
    <button className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {label}
    </button>
  );
}
