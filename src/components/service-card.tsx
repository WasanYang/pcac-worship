import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import type { Service, TeamMember } from '@/lib/placeholder-data';
import { Timestamp } from 'firebase/firestore';

export const ServiceCard = ({
  service,
  teamsMembers,
  isUserInvolved,
}: {
  service: Service;
  teamsMembers?: TeamMember[];
  isUserInvolved: boolean;
}) => {
  console.log('service', service);
  console.log('allUsers', teamsMembers);
  const formatServiceDate = () => {
    if (!(service.date instanceof Timestamp)) {
      return '';
    }

    const serviceDate = service.date.toDate();
    const currentYear = new Date().getFullYear();
    const serviceYear = serviceDate.getFullYear();

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (serviceYear !== currentYear) {
      options.year = 'numeric';
    }

    return serviceDate.toLocaleDateString('en-US', options);
  };

  return (
    <Card
      className={cn(
        'flex flex-col bg-card shadow-none border-0 h-full group p-1 rounded-3xl transition-all',
        !isUserInvolved && 'grayscale hover:grayscale-0'
      )}
    >
      <div className='overflow-hidden rounded-3xl relative'>
        <Image
          src={service.imageUrl || '/placeholder.svg'}
          alt={service.theme}
          width={300}
          height={300}
          className='aspect-square w-full object-cover transition-transform group-hover:scale-105'
          data-ai-hint='worship service'
        />
        <div className='absolute top-2 left-2'>
          <Badge className='mr-1' data-ai-hint='service date'>
            {formatServiceDate()}
          </Badge>
          <Badge variant='secondary' className='bg-card'>
            {service.theme}
          </Badge>
        </div>
      </div>
      <CardContent className='p-2 pt-3'>
        <div className='flex -space-x-2 overflow-hidden'>
          {teamsMembers?.map((member, idx) => (
            <Avatar //
              key={idx}
              className='inline-block h-6 w-6 rounded-full ring-2 ring-background' //
            >
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>{member?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
