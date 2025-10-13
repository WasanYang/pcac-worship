"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamMembers, Role } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import { useI18n } from "@/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const roles: Role[] = ["Worship Leader", "Vocalist", "Keys", "Guitar (Acoustic)", "Guitar (Electric)", "Bass", "Drums"];

export default function TeamPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role | "">("");

  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteRole) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter an email and select a role.",
        });
        return;
    }
    // Here you would typically handle the invitation logic,
    // e.g., sending an email or creating an invitation document in Firestore.
    console.log(`Inviting ${inviteEmail} as a ${inviteRole}`);

    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${inviteEmail}.`,
    });

    // Reset form and close dialog
    setInviteEmail("");
    setInviteRole("");
    setIsDialogOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('teamMembers')}</h1>
          <p className="text-muted-foreground">{t('teamMembersDesc')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {t('addMember')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Enter the email address and assign a role for the new team member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="col-span-3"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select onValueChange={(value: Role) => setInviteRole(value)} value={inviteRole || undefined}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSendInvitation}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="text-center">
            <CardHeader>
              <Avatar className="mx-auto h-20 w-20">
                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
              <Button variant="outline" size="sm">{t('profile')}</Button>
              <Button variant="secondary" size="sm">{t('skills')}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
