import { Text, Link, Alert, AlertIcon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const SetupRepoAlert = () => {
  const { t } = useTranslation();

  return (
    <Alert>
      <AlertIcon display={'inline-block'} />
      <Text>
        {t('Setup repo alert')}
        <Link
          href={`${process.env.REACT_APP_DOC_URL}add-repository/existing-repo/#setup-your-existing-repository`}
          isExternal>
          <ExternalLinkIcon _hover={{ color: 'blue.500' }} m={'0 4px'} />
        </Link>
      </Text>
    </Alert>
  );
};

export default SetupRepoAlert;
