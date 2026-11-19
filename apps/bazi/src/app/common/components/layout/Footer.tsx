'use client';

import { useLocale } from '../../../lib/i18n/locale-context';

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="bg-bz-paper border-t border-bz-border py-6">
      <div className="container mx-auto px-5 md:px-10 text-center">
        <p className="text-bz-muted text-xs tracking-widest">
          {t('footer.text')}
        </p>
      </div>
    </footer>
  );
}
