import { useMemo, useEffect } from 'react';
import { Select, Skeleton } from '@chakra-ui/react';
import {
  useGetOrganizationQuery,
  useGetUserQuery
} from '../../redux/services/octokitApi';

export interface Owner {
  name: string;
  type: 'user' | 'org';
}
interface IProps {
  value?: Owner;
  onChange: (data?: Owner) => void;
}

const OwnerSelect = ({ value, onChange }: IProps) => {
  const { data: orgsData } = useGetOrganizationQuery(undefined);
  const { data: userData } = useGetUserQuery(undefined);

  const data: Owner[] = useMemo(() => {
    if (!userData || !orgsData) return [];

    return [
      { name: userData.login, type: 'user' as const },
      ...orgsData.map((org) => ({ name: org.login, type: 'org' as const }))
    ];
  }, [userData, orgsData]);

  useEffect(() => {
    if (data.length && !value) {
      onChange(data[0]);
    }
  }, [value, onChange, data]);

  if (!data.length) return <Skeleton height="40px" />;

  return (
    <Select
      value={value?.name}
      onChange={(e) => {
        onChange(data.find((owner) => owner.name === e.target.value));
      }}>
      {data?.map((owner) => (
        <option value={owner.name} key={owner.name}>
          {owner.name}
        </option>
      ))}
    </Select>
  );
};

export default OwnerSelect;
