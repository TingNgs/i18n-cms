import {
  Link as ChakraLink,
  ButtonGroup,
  Flex,
  Stack,
  Text
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthButton from '../../component/AuthButton';
import { isAuthSelector } from '../../redux/selector';
import { useAppSelector } from '../../redux/store';

const About = () => {
  const { t: commonT } = useTranslation();
  const { t: homeT } = useTranslation('home');

  const isAuth = useAppSelector(isAuthSelector);

  return (
    <Stack>
      <Flex p="5" alignSelf={'center'} w={{ lg: '70%' }}>
        <Stack w={{ lg: '50%' }} fontWeight="semibold" spacing={5}>
          <Text fontSize="3xl">{homeT('header.title')}</Text>
          <Text fontSize="1xl">{homeT('header.description')}</Text>
          {!isAuth && <Text>{homeT('header.start_description')}</Text>}
          <ButtonGroup>
            {isAuth ? (
              <ChakraLink as={Link} variant="button" to="/menu">
                {commonT('Get Started')}
              </ChakraLink>
            ) : (
              <AuthButton />
            )}
            <ChakraLink
              variant="outlineButton"
              href={process.env.REACT_APP_DOC_URL || ''}
              isExternal>
              {commonT('Documentation')}
            </ChakraLink>
          </ButtonGroup>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default About;
