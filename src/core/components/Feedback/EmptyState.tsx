import { Text } from "react-native";

export type EmptyStateProps = {
  message: string;
};

/** The one empty-list message style, previously inlined on every list. */
const EmptyState = ({ message }: EmptyStateProps) => (
  <Text className="home-empty-state">{message}</Text>
);

export default EmptyState;
