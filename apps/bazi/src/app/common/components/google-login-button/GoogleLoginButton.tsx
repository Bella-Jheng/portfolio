'use client';

import { useAuth } from '../../../lib/auth-context';

type Variant = 'primary' | 'outline' | 'dark';

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-bz-brown text-white hover:opacity-80',
  outline: 'border border-bz-gold/40 text-bz-gold hover:bg-bz-gold/10',
  dark: 'bg-[#4A4A4A] text-white hover:bg-black',
};

interface Props {
  variant?: Variant;
  className?: string;
  onBeforeLogin?: () => void;
}

export function GoogleLoginButton({ variant = 'primary', className = '', onBeforeLogin }: Props) {
  const { login } = useAuth();

  const handleClick = () => {
    onBeforeLogin?.();
    login();
  };

  return (
    <button
      onClick={handleClick}
      className={`text-sm rounded-full transition-all tracking-wider ${VARIANT_STYLES[variant]} ${className}`}
    >
      Google 登入
    </button>
  );
}
