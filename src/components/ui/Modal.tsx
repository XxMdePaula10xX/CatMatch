import type { ReactNode } from 'react';

interface ModalProps {
  variant?: 'win' | 'lose' | 'plain';
  children: ReactNode;
}

/** Centered modal card with overlay. */
export function Modal({ variant = 'plain', children }: ModalProps) {
  return (
    <div className="modal-overlay">
      <div className={`modal modal--${variant}`}>{children}</div>
    </div>
  );
}

/** A row of up to three stars, lighting up `count` of them. */
export function Stars({ count }: { count: number }) {
  return (
    <div className="stars">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`star ${i < count ? 'on' : ''}`}>
          ⭐
        </span>
      ))}
    </div>
  );
}
