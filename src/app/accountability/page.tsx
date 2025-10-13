"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { accountabilityGroups, teamMembers } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/providers/i18n-provider";

export default function AccountabilityPage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('accountabilityGroups')}</h1>
            <p className="text-muted-foreground">{t('accountabilityGroupsDesc')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('createGroup')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {accountabilityGroups.map((group) => {
            const leader = teamMembers.find(m => m.name === group.leader);
            return (
                <Card key={group.id}>
                    <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                        {t('ledBy')} 
                        <span className="font-semibold text-foreground"> {group.leader}</span>
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ul className="space-y-4">
                        {group.members.map((member) => {
                            const memberInfo = teamMembers.find(m => m.name === member.name);
                            return (
                                <li key={member.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                    <AvatarImage src={memberInfo?.avatarUrl} alt={member.name} data-ai-hint="person portrait"/>
                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{memberInfo?.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">{t('status')}:</span>
                                   <Select defaultValue={member.contactStatus}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                      <SelectValue placeholder={t('status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Contacted">{t('contacted')}</SelectItem>
                                      <SelectItem value="Pending">{t('pending')}</SelectItem>
                                      <SelectItem value="Missed">{t('missed')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                </li>
                            );
                        })}
                    </ul>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
