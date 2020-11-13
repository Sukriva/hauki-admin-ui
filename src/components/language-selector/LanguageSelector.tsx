import React from 'react';
import { Navigation } from 'hds-react';
import { LanguageOption } from '../../common/lib/types';

export const languageOptions: LanguageOption[] = [
  { label: 'Suomeksi', value: 'fi' },
  { label: 'Svenska', value: 'sv' },
  { label: 'English', value: 'en' },
];

export default function LanguageSelect({
  language,
  setLanguage,
}: {
  language: LanguageOption;
  setLanguage: (language: LanguageOption) => void;
}): JSX.Element {
  const formatSelectedValue = ({ value }: LanguageOption): string =>
    value.toUpperCase();

  return (
    <Navigation.LanguageSelector
      className="opening-periods-header-language-selector"
      ariaLabel="Aukioloaikojen valittu kieli"
      options={languageOptions}
      formatSelectedValue={formatSelectedValue}
      onLanguageChange={setLanguage}
      value={language}
    />
  );
}
