import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  return <div>{t('Existing repository')}</div>;
};

export default Dashboard;
