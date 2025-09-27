import * as React from 'react';

export const Languages: Array<{
  code: string;
  name: string;
  flag: string;
}> = [
  {code: '', name: 'Translate', flag: '🌐'},
  {code: 'en', name: 'English', flag: '🇺🇸'},
  {code: 'es', name: 'Spanish', flag: '🇪🇸'},
  {code: 'fr', name: 'French', flag: '🇫🇷'},
  {code: 'de', name: 'German', flag: '🇩🇪'},
  {code: 'it', name: 'Italian', flag: '🇮🇹'},
  {code: 'pt', name: 'Portuguese', flag: '🇵🇹'},
  {code: 'ru', name: 'Russian', flag: '🇷🇺'},
  {code: 'ja', name: 'Japanese', flag: '🇯🇵'},
  {code: 'ko', name: 'Korean', flag: '🇰🇷'},
  {code: 'zh', name: 'Chinese', flag: '🇨🇳'},
  {code: 'ar', name: 'Arabic', flag: '🇸🇦'},
  {code: 'hi', name: 'Hindi', flag: '🇮🇳'},
  {code: 'nl', name: 'Dutch', flag: '🇳🇱'},
  {code: 'sv', name: 'Swedish', flag: '🇸🇪'},
  {code: 'no', name: 'Norwegian', flag: '🇳🇴'},
  {code: 'da', name: 'Danish', flag: '🇩🇰'},
  {code: 'fi', name: 'Finnish', flag: '🇫🇮'},
  {code: 'pl', name: 'Polish', flag: '🇵🇱'},
  {code: 'tr', name: 'Turkish', flag: '🇹🇷'},
  {code: 'th', name: 'Thai', flag: '🇹🇭'},
  {code: 'ig', name: 'Igbo', flag: '🇳🇬'},
  {code: 'ha', name: 'Hausa', flag: '🇳🇬'},
  {code: 'yo', name: 'Yoruba', flag: '🇳🇬'},
];

export const LanguageOptions = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (language: string) => void;
  className?: string;
}): React.ReactElement => {
  return (
    <div className="language-selector">
      <select
        className={className || 'translate-selector'}
        value={value ?? 'en'}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {Languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};
