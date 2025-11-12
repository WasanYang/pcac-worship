import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import type { Service, TeamMember } from '@/lib/placeholder-data';
import { Timestamp } from 'firebase/firestore';
import { useI18n } from '@/providers/i18n-provider';
import { useAuth } from '@/firebase';

export const ServiceCard = ({
  service,
  teamsMembers,
}: {
  service: Service;
  teamsMembers?: TeamMember[];
}) => {
  const { locale } = useI18n();
  const { currentUser } = useAuth();

  const isLeader = service.worshipLeaderId === currentUser?.uid;
  const isParticipant =
    isLeader ||
    service.teams?.some((member) => member === currentUser?.uid) ||
    false;
  const isOver = service.date.toDate() < new Date();

  const worshipLeader = teamsMembers?.find(
    (member) => member.id === service.worshipLeaderId
  );

  const formattedDate = (() => {
    if (!(service.date instanceof Timestamp)) {
      return '';
    }

    const serviceDate = service.date.toDate();
    const currentYear = new Date().getFullYear();
    const serviceYear = serviceDate.getFullYear();
    const today = new Date();
    const diffTime = serviceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (serviceYear !== currentYear) {
      options.year = 'numeric';
    }

    if (diffDays >= 0 && diffDays <= 31) {
      options.weekday = 'short';
    }

    return serviceDate.toLocaleDateString(locale, options);
  })();

  return (
    <Card
      className={cn(
        'flex flex-col bg-card shadow-none border-0 h-full group p-1 rounded-3xl transition-all',
        isOver && 'opacity-60',
        !isOver && !isParticipant && 'grayscale hover:grayscale-0'
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
            {formattedDate}
          </Badge>
          <Badge variant='secondary' className='bg-card'>
            {service.theme}
          </Badge>
        </div>
        {worshipLeader && (
          <div className='absolute bottom-2 right-2'>
            <Avatar className='h-8 w-8 border-2 border-background'>
              <AvatarImage
                src={worshipLeader.avatarUrl}
                alt={worshipLeader.name}
              />
              <AvatarFallback>{worshipLeader.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}
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
