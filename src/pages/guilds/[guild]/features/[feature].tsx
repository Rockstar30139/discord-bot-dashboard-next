import { Icon } from '@chakra-ui/react';
import { Center, Heading, Text } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { features } from '@/config/features';
import { CustomFeatures, FeatureConfig } from '@/config/types';
import { BsSearch } from 'react-icons/bs';
import { useEnableFeatureMutation, useFeatureQuery } from '@/stores';
import { useColors } from '@/theme';
import { UpdateFeaturePanel } from '@/components/feature/UpdateFeaturePanel';
import { feature as view } from '@/config/translations/feature';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

export type Params = {
  guild: string;
  feature: keyof CustomFeatures;
};

export type UpdateFeatureValue<K extends keyof CustomFeatures> = Partial<CustomFeatures[K]>;

const FeaturePage: NextPageWithLayout = () => {
  const { feature, guild } = useRouter().query as Params;

  const query = useFeatureQuery(guild, feature);
  const featureConfig = features[feature] as FeatureConfig<typeof feature>;
  const skeleton = featureConfig?.useSkeleton?.();

  if (featureConfig == null) return <NotFound />;
  if (query.isError) return <NotEnabled />;
  if (query.isLoading) return <>{skeleton}</> ?? <LoadingPanel size="sm" />;
  return <UpdateFeaturePanel id={feature} feature={query.data} config={featureConfig} />;
};

function NotEnabled() {
  const t = view.useTranslations();
  const { guild, feature } = useRouter().query as Params;
  const { textColorSecondary } = useColors();
  const enable = useEnableFeatureMutation(guild, feature);

  return (
    <Center flexDirection="column" h="full" gap={1}>
      <Text fontSize="xl" fontWeight="600">
        {t.error['not enabled']}
      </Text>
      <Text color={textColorSecondary}>{t.error['not enabled description']}</Text>
      <Button
        mt={3}
        isLoading={enable.isLoading}
        onClick={() => enable.mutate({ enabled: true })}
        variant="brand"
      >
        {t.bn.enable}
      </Button>
    </Center>
  );
}

function NotFound() {
  const t = view.useTranslations();
  const { textColorSecondary } = useColors();

  return (
    <Center flexDirection="column" gap={2} h="full">
      <Icon as={BsSearch} w="50px" h="50px" />
      <Heading size="lg">{t.error['not found']}</Heading>
      <Text color={textColorSecondary}>{t.error['not found description']}</Text>
    </Center>
  );
}

FeaturePage.auth = true;
FeaturePage.getLayout = (c) => getGuildLayout({ children: c, back: true });
export default FeaturePage;
