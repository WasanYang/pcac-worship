'use client';

import { Card, CardContent } from '@/components/ui/card';
import 'react-image-crop/dist/ReactCrop.css';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  updateDocumentNonBlocking,
  useAuth,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronRight,
  Check,
  Camera,
  Edit,
  HelpCircle,
  Languages,
  LogOut,
  Loader2,
  Settings,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers/i18n-provider';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { deleteFile, uploadFile } from '@/lib/features/user/user-services';
import { toast } from '@/hooks/use-toast';
import { TeamMember } from '@/lib/placeholder-data';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import { canvasPreview } from '@/lib/crop-image';
const MEMBER_PROFILE_PATH = 'team/avatar/';

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { t, locale, setLocale } = useI18n();

  const [displayName, setDisplayName] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'team_members', user.uid) : null),
    [firestore, user]
  );
  const { data: teamMember } = useDoc<TeamMember>(userDocRef);

  const getInitials = (name?: string | null) => {
    if (displayName) {
      name = displayName;
    }
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  useEffect(() => {
    const currentName = teamMember?.name || user?.displayName || '';
    if (currentName) {
      setDisplayName(currentName);
    }
  }, [teamMember, user]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getPathFromUrl = (url: string): string | null => {
    try {
      const urlObject = new URL(url);
      const pathName = urlObject.pathname;
      const matches = pathName.match(/\/o\/(.+?)(?=\?|$)/);
      return matches && matches[1] ? decodeURIComponent(matches[1]) : null;
    } catch (error) {
      console.error('Invalid URL for getPathFromUrl:', error);
      return null;
    }
  };

  const onSelectFile = (file: File | null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      // 5MB limit
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    setCrop(undefined); // Makes crop preview update between images
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  const handleSaveCrop = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }

    const canvas = document.createElement('canvas');
    await canvasPreview(image, canvas, completedCrop);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          startTransition(async () => {
            setIsCropping(false);
            try {
              const oldPath =
                teamMember?.avatarUrl && getPathFromUrl(teamMember.avatarUrl);
              if (oldPath) {
                await deleteFile({ path: oldPath });
              }
            } catch (error: any) {
              if (
                error.code === 404 ||
                (error.message && error.message.includes('404'))
              ) {
                console.warn('Old avatar not found, proceeding with upload.');
              } else {
                throw error;
              }
            }

            try {
              const { url } = await uploadFile({
                fileDataUri: dataUri,
                path: `${MEMBER_PROFILE_PATH}${user?.uid}/profile.webp`,
              });

              const finalUrl = `${
                url.split('?')[0]
              }?alt=media&t=${new Date().getTime()}`;

              if (userDocRef) {
                await updateDocumentNonBlocking(userDocRef, {
                  avatarUrl: finalUrl,
                });
              }
              toast({
                title: 'Success',
                description: 'Profile picture updated.',
              });
            } catch (error) {
              console.error('Upload process failed:', error);
              toast({ variant: 'destructive', title: 'Upload failed' });
            }
          });
        };
        reader.readAsDataURL(blob);
      },
      'image/webp',
      0.9
    );
  };

  const handleNameSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (userDocRef) {
          updateDocumentNonBlocking(userDocRef, {
            name: formData.get('displayName'),
          });
        }
      } catch (error) {
        console.error('Error updating name:', error);
      }
    });
  };

  const menuItems = [
    {
      id: 'settings',
      label: t('settings'),
      icon: Settings,
      content: (
        <div>
          <p className='text-muted-foreground mb-4'>{t('appearanceDesc')}</p>
          <ThemeToggle />
        </div>
      ),
    },
    {
      id: 'language',
      label: t('language'),
      icon: Languages,
      content: (
        <div className='space-y-2'>
          <Button
            variant={locale === 'en' ? 'default' : 'outline'}
            className='w-full justify-start'
            onClick={() => setLocale('en')}
          >
            English
          </Button>
          <Button
            variant={locale === 'th' ? 'default' : 'outline'}
            className='w-full justify-start'
            onClick={() => setLocale('th')}
          >
            ไทย
          </Button>
        </div>
      ),
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      content: <p>Frequently Asked Questions will be displayed here.</p>,
    },
  ];

  return (
    <div className='flex flex-col h-full justify-between'>
      <Dialog open={isCropping} onOpenChange={setIsCropping}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop your new profile picture</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className='flex justify-center'>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt='Crop me'
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '70vh' }}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCropping(false);
                setImgSrc('');
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={!completedCrop || isPending}
            >
              {isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='flex flex-col items-center gap-6 pt-4'>
        <div
          className='relative group cursor-pointer'
          onClick={handleAvatarClick}
        >
          <Avatar className='h-24 w-24 border-2 border-primary'>
            <AvatarImage
              src={teamMember?.avatarUrl || ''}
              alt={teamMember?.name || 'User'}
            />
            <AvatarFallback className='text-3xl'>
              {getInitials(user?.displayName || teamMember?.name)}
            </AvatarFallback>
          </Avatar>
          <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
            {isPending ? (
              <Loader2 className='h-8 w-8 text-white animate-spin' />
            ) : (
              <Camera className='h-8 w-8 text-white' />
            )}
          </div>
          <input
            type='file'
            ref={fileInputRef}
            onChange={(e) => onSelectFile(e.target.files?.[0] || null)}
            className='hidden'
            accept='image/*'
          />
        </div>

        <form
          ref={formRef}
          action={handleNameSubmit}
          className='text-center group relative'
        >
          <div className='relative'>
            <input
              type='text'
              name='displayName'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className='text-2xl font-bold text-center bg-transparent border-none focus:ring-1 focus:ring-primary focus:rounded-md outline-none w-full max-w-xs'
              aria-label='Display Name'
            />
            {displayName !== (teamMember?.name || user?.displayName) && (
              <Button
                type='submit'
                variant='ghost'
                size='icon'
                className='absolute -right-10 top-1/2 -translate-y-1/2 h-8 w-8'
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <Check className='h-5 w-5 text-green-500' />
                )}
              </Button>
            )}
          </div>
          <p className='text-muted-foreground mt-1'>{user?.email}</p>
        </form>
      </div>

      <div className='px-4 pb-4'>
        <Card className='w-full max-w-md mx-auto rounded-xl !border-0'>
          <CardContent className='p-2 !border-0'>
            <div className='w-full space-y-1'>
              {menuItems.map((item) => (
                <Sheet key={item.id}>
                  <SheetTrigger asChild>
                    <Button
                      variant='ghost'
                      className='w-full justify-between h-14 text-base'
                    >
                      <div className='flex items-center gap-4'>
                        <item.icon className='h-5 w-5 ' />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className='h-5 w-5 text-muted-foreground' />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{item.label}</SheetTitle>
                    </SheetHeader>
                    <div className='py-4'>{item.content}</div>
                  </SheetContent>
                </Sheet>
              ))}
              <Separator />
              <Button
                variant='ghost'
                className='w-full justify-start h-14 text-base hover:text-destructive hover:bg-destructive/10'
                onClick={handleLogout}
              >
                <LogOut className='mr-4 h-5 w-5' />
                {t('logOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
