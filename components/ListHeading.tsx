import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const ListHeading = ({ title }: ListHeadingProps) => {
  const { t } = useTranslation();

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <TouchableOpacity className="list-action">
        <Text className="list-action-text">{t('common.viewAll')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ListHeading;
