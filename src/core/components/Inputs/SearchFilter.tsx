import { TextInput } from "react-native";
import { colors } from "@/core/theme/tokens";

export type SearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

/** Client-side search over already-loaded rows (architecture §9). */
const SearchFilter = ({ value, onChange, placeholder }: SearchFilterProps) => (
  <TextInput
    className="search-input"
    placeholder={placeholder}
    placeholderTextColor={colors.mutedForeground}
    value={value}
    onChangeText={onChange}
    autoCapitalize="none"
    autoCorrect={false}
    returnKeyType="search"
  />
);

export default SearchFilter;
