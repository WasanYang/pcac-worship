"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { upcomingServices, teamMembers } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import { useI18n } from "@/providers/i18n-provider";

export default function ServicesPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('services')}</h1>
            <p className="text-muted-foreground">{t('servicesDesc')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('createService')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingServices.map((service) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{service.theme}</CardTitle>
              <CardDescription>{service.sermonTheme}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <Badge variant="outline">{service.date}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t('leader')}:</span>
                   <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={teamMembers.find(m => m.name === service.worshipLeader)?.avatarUrl} alt={service.worshipLeader} />
                            <AvatarFallback>{service.worshipLeader.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{service.worshipLeader}</span>
                      </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                {t('viewPlan')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
