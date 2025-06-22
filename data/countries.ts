export interface CountryInfo {
  label: string;
  value: string;
  callingCode: string;
}

const countries: CountryInfo[] = [
  { value: 'US', label: 'United States', callingCode: '+1' },
  { value: 'GB', label: 'United Kingdom', callingCode: '+44' },
  { value: 'CA', label: 'Canada', callingCode: '+1' },
  { value: 'AU', label: 'Australia', callingCode: '+61' },
  { value: 'DE', label: 'Germany', callingCode: '+49' },
  { value: 'FR', label: 'France', callingCode: '+33' },
  { value: 'IN', label: 'India', callingCode: '+91' },
  { value: 'PK', label: 'Pakistan', callingCode: '+92' },
  { value: 'CN', label: 'China', callingCode: '+86' },
  { value: 'JP', label: 'Japan', callingCode: '+81' },
  { value: 'BR', label: 'Brazil', callingCode: '+55' },
  { value: 'ZA', label: 'South Africa', callingCode: '+27' },
  { value: 'NG', label: 'Nigeria', callingCode: '+234' },
  { value: 'RU', label: 'Russia', callingCode: '+7' },
  { value: 'SA', label: 'Saudi Arabia', callingCode: '+966' },
];

export default countries;
