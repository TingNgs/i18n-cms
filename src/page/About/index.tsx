import {
  Link as ChakraLink,
  ButtonGroup,
  Flex,
  Stack,
  Text,
  Image,
  useColorModeValue,
  AspectRatio,
  Heading
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthButton from '../../component/AuthButton';
import { isAuthSelector } from '../../redux/selector';
import { useAppSelector } from '../../redux/store';

import HeaderDarkImage from './image/header-dark.png';
import HeaderLightImage from './image/header-light.png';

const About = () => {
  const { t: commonT } = useTranslation();
  const { t: homeT } = useTranslation('home');

  const isAuth = useAppSelector(isAuthSelector);

  return (
    <Stack alignItems="center">
      <Flex
        p="var(--chakra-space-10) var(--chakra-space-5) "
        alignItems={'center'}
        maxWidth="1200px"
        flexDir={{ base: 'column', lg: 'row' }}
        gap={5}>
        <Stack
          fontWeight="semibold"
          w={{ lg: '45%' }}
          flexShrink="0"
          spacing={5}>
          <Heading as="h1" fontSize="3xl">
            {homeT('header.title')}
          </Heading>
          <Text fontSize="1xl">{homeT('header.description')}</Text>
          {!isAuth && <Text>{homeT('header.start_subtitle')}</Text>}
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
        <Flex flex={1} w={{ base: '80%', lg: 'auto' }} justifyContent="center">
          <AspectRatio maxWidth="40rem" ratio={16 / 9} w="100%">
            <Image
              src={useColorModeValue(HeaderLightImage, HeaderDarkImage)}
              alt="app screenshot"
            />
          </AspectRatio>
        </Flex>
      </Flex>
    </Stack>
  );
};

export default About;
