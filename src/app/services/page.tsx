
"use client";

import Image from "next/image";
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

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {upcomingServices.map((service) => (
          <Card key={service.id} className="flex flex-col bg-transparent shadow-none border-0">
             <div className="overflow-hidden rounded-md">
                <Image
                src={service.imageUrl}
                alt={service.theme}
                width={300}
                height={300}
                className="aspect-square w-full object-cover transition-transform hover:scale-105"
                data-ai-hint="worship service"
                />
            </div>
            <CardHeader className="p-2 pt-4">
              <CardTitle className="text-base truncate">{service.theme}</CardTitle>
              <CardDescription className="text-xs">{service.date}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
