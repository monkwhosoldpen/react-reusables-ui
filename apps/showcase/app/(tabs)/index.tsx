// import { Link } from 'expo-router';
// import * as React from 'react';
// import { Platform, View } from 'react-native';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '~/components/ui/alert-dialog';
// import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
// import { Button } from '~/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
// } from '~/components/ui/context-menu';
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '~/components/ui/dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '~/components/ui/dropdown-menu';
// import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card';
// import { Text } from '~/components/ui/text';
// import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
// import { Muted } from '~/components/ui/typography';
// import { CalendarDays } from '~/lib/icons/CalendarDays';
// import { ChevronDown } from '~/lib/icons/ChevronDown';
// import { ChevronRight } from '~/lib/icons/ChevronRight';
// import { Info } from '~/lib/icons/Info';
// import { cn } from '~/lib/utils';
// import { useAuth } from '~/lib/contexts/AuthContext';

// export default function ExampleScreen() {
//   const { user } = useAuth();

//   return (
//     <View className='flex-1 p-6 justify-center gap-6'>
//       <Card className='w-full max-w-lg mx-auto'>
//         <CardHeader>
//           <View className='flex-row gap-3'>
//             <CardTitle className='pt-1'>Team Members</CardTitle>
//             <Tooltip delayDuration={150}>
//               <TooltipTrigger className='web:focus:outline-none'>
//                 <Info size={Platform.OS == 'web' ? 14 : 16} className='text-foreground' />
//               </TooltipTrigger>
//               <TooltipContent side='bottom' insets={contentInsets} className='gap-1 py-3 px-5'>
//                 <Text className='native:text-lg font-bold'>Things to try:</Text>
//                 <Text className='native:text-lg text-muted-foreground'>
//                   · {Platform.OS === 'web' ? 'Hover' : 'Press'} the team member's name
//                 </Text>
//                 <Text className='native:text-lg text-muted-foreground'>
//                   · {Platform.OS === 'web' ? 'Right click' : 'Press and hold'} the avatar
//                 </Text>
//               </TooltipContent>
//             </Tooltip>
//           </View>
//           <CardDescription>Invite your team members to collaborate.</CardDescription>
//         </CardHeader>
//         <CardContent className='gap-8'>
//           <View className='flex-row gap-3'>
//             <View className='flex-1 flex-row gap-3'>
//               <TeamMemberAvatar
//                 initials='ZN'
//                 name='Zach Nugent'
//                 uri='https://github.com/mrzachnugent.png'
//               />
//               <View className='flex-1'>
//                 <TeamMemberHoverCard name='Zach Nugent' />
//                 <Text numberOfLines={1} className='text-muted-foreground'>
//                   zachnugent@example.com
//                 </Text>
//               </View>
//             </View>
//             <RoleDropdownSelect defaultValue='Billing' />
//           </View>
//           <View className='flex-row gap-3'>
//             <View className='flex-1 flex-row gap-3'>
//               <TeamMemberAvatar initials='JD' name='Jane Doe' uri='invalid link' />
//               <View className='flex-1'>
//                 <TeamMemberHoverCard name='Jane Doe' />
//                 <Text numberOfLines={1} className='text-muted-foreground'>
//                   jane@example.com
//                 </Text>
//               </View>
//             </View>
//             <RoleDropdownSelect defaultValue='Owner' />
//           </View>
//         </CardContent>
//       </Card>
//       <View className='items-center'>
//         <Link href='/elonmusk' asChild>
//           <Button variant='link' className='flex-row'>
//             <Text>Go To Public Profile (Elon Musk)</Text>
//             <ChevronRight className='text-foreground' size={18} />
//           </Button>
//         </Link>

//         {!user && (
//           <Link href='/login' asChild>
//             <Button variant='link' className='flex-row'>
//               <Text>Go To Login</Text>
//               <ChevronRight className='text-foreground' size={18} />
//             </Button>
//           </Link>
//         )}

//         {user && (
//           <Link href='/explore' asChild>
//             <Button variant='link' className='flex-row'>
//               <Text>Explore</Text>
//               <ChevronRight className='text-foreground' size={18} />
//             </Button>
//           </Link>
//         )}
//       </View>
//     </View>
//   );
// }

// const contentInsets = {
//   left: 12,
//   right: 12,
// };

// function RoleDropdownSelect({ defaultValue }: { defaultValue: string }) {
//   const [value, setValue] = React.useState(defaultValue);
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant='outline'
//           size={Platform.OS === 'web' ? 'sm' : 'default'}
//           className='flex-row gap-2 native:pr-3'
//         >
//           <Text>{value}</Text>
//           <ChevronDown size={18} className='text-foreground' />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align='end' insets={contentInsets} className='w-64 native:w-72'>
//         <DropdownMenuLabel>Select new role</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup className='gap-1'>
//           <DropdownMenuItem
//             onPress={() => {
//               setValue('Viewer');
//             }}
//             className={cn(
//               'flex-col items-start gap-1',
//               value === 'Viewer' ? 'bg-secondary/70' : ''
//             )}
//           >
//             <Text>Viewer</Text>
//             <Muted>Can view and comment.</Muted>
//           </DropdownMenuItem>
//           <DropdownMenuItem
//             onPress={() => {
//               setValue('Billing');
//             }}
//             className={cn(
//               'flex-col items-start gap-1',
//               value === 'Billing' ? 'bg-secondary/70' : ''
//             )}
//           >
//             <Text>Billing</Text>
//             <Muted>Can view, comment, and manage billing.</Muted>
//           </DropdownMenuItem>
//           <DropdownMenuItem
//             onPress={() => {
//               setValue('Owner');
//             }}
//             className={cn('flex-col items-start gap-1', value === 'Owner' ? 'bg-secondary/70' : '')}
//           >
//             <Text>Owner</Text>
//             <Muted>Admin-level access to all resources</Muted>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// function TeamMemberHoverCard({ name }: { name: string }) {
//   return (
//     <HoverCard openDelay={0} closeDelay={0}>
//       <HoverCardTrigger className='group web:focus:outline-none'>
//         <Text numberOfLines={1} className='group-active:underline web:group-hover:underline'>
//           {name}
//         </Text>
//       </HoverCardTrigger>
//       <HoverCardContent insets={contentInsets} className='w-80 native:w-96'>
//         <View className='flex flex-row justify-between gap-4'>
//           <Avatar alt='Vercel avatar'>
//             <AvatarImage source={{ uri: 'https://github.com/vercel.png' }} />
//             <AvatarFallback>
//               <Text>VC</Text>
//             </AvatarFallback>
//           </Avatar>
//           <View className='gap-1 flex-1'>
//             <Text className='text-sm native:text-base font-semibold'>{name}</Text>
//             <Text className='text-sm native:text-base'>
//               Wishes they were part of the triangle company.
//             </Text>
//             <View className='flex flex-row items-center pt-2 gap-2'>
//               <CalendarDays size={14} className='text-foreground opacity-70' />
//               <Text className='text-xs native:text-sm text-muted-foreground'>
//                 Fingers crossed since December 2021
//               </Text>
//             </View>
//           </View>
//         </View>
//       </HoverCardContent>
//     </HoverCard>
//   );
// }

// function TeamMemberAvatar({
//   name,
//   initials,
//   uri,
// }: {
//   name: string;
//   initials: string;
//   uri: string;
// }) {
//   const [isDialogOpen, setDialogOpen] = React.useState(false);
//   const [isAlertDialogOpen, setAlertDialogOpen] = React.useState(false);
//   return (
//     <ContextMenu relativeTo='trigger'>
//       <ContextMenuTrigger tabIndex={-1} className='web:cursor-default web:focus:outline-none'>
//         <Avatar alt={`${name}'s avatar`}>
//           <AvatarImage source={{ uri }} />
//           <AvatarFallback>
//             <Text>{initials}</Text>
//           </AvatarFallback>
//         </Avatar>
//       </ContextMenuTrigger>

//       <ContextMenuContent align='start' insets={contentInsets} className='w-64 native:w-72'>
//         <ContextMenuItem>
//           <Text>View</Text>
//         </ContextMenuItem>

//         <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <ContextMenuItem closeOnPress={false}>
//               <Text className='font-semibold'>Edit</Text>
//             </ContextMenuItem>
//           </DialogTrigger>
//           <DialogContent className='sm:max-w-[425px] native:w-[385px]'>
//             <DialogHeader>
//               <DialogTitle>Edit profile</DialogTitle>
//               <DialogDescription>
//                 Make changes to the profile here. Click save when you're done.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button>
//                   <Text>OK</Text>
//                 </Button>
//               </DialogClose>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         <AlertDialog open={isAlertDialogOpen} onOpenChange={setAlertDialogOpen}>
//           <AlertDialogTrigger asChild>
//             <ContextMenuItem closeOnPress={false}>
//               <Text className='text-destructive font-semibold'>Delete</Text>
//             </ContextMenuItem>
//           </AlertDialogTrigger>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete your account and remove
//                 your data from our servers.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>
//                 <Text>Cancel</Text>
//               </AlertDialogCancel>
//               <AlertDialogAction>
//                 <Text>Continue</Text>
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </ContextMenuContent>
//     </ContextMenu>
//   );
// }



import { useAuth } from '@/lib/contexts/AuthContext';
import LoginCommon from '@/components/common/LoginCommon';
import { MainScreen } from "~/components/main";
import { View, StyleSheet, ViewStyle, ActivityIndicator, Animated, Text } from 'react-native';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { useState, useEffect } from 'react';
import { indexedDB } from '@/lib/services/indexedDB';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoginWrapper() {
  const { signIn, signInAnonymously, signInAsGuest } = useAuth();
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInAnonymously();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInAsGuest();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme.colors.background }}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <LoginCommon
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleAnonymousSignIn={handleAnonymousSignIn}
          handleGuestSignIn={handleGuestSignIn}
          onCancel={() => {}}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

export default function Index() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Initialize IndexedDB and check cache
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize IndexedDB first
        await indexedDB.initialize();
        setDbInitialized(true);

        // Then check for cached user
        const users = await indexedDB.getAllUsers();
        if (users.length > 0) {
          setCachedUser(users[0]);
        }

        // If we have a user, preload their data
        if (user?.id) {
          const [follows, requests] = await Promise.all([
            indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
            indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id)
          ]);
          setUserData({ follows, requests });
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  }, [user?.id]);

  // Update cached user and load data when auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setCachedUser(user);
        if (user.id) {
          try {
            const [follows, requests] = await Promise.all([
              indexedDB.getAllFromIndex('user_channel_follow', 'by-user', user.id),
              indexedDB.getAllFromIndex('tenant_requests', 'by-user', user.id)
            ]);
            setUserData({ follows, requests });
            setDataLoaded(true);
          } catch (error) {
            console.error('Error loading user data:', error);
            setDataLoaded(false);
          }
        }
      } else {
        // Clear cached user and data when user logs out
        setCachedUser(null);
        setDataLoaded(false);
        setUserData(null);
      }
    };

    loadUserData();
  }, [user]);

  // Show blank screen until initialization is complete
  if (!initialized) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colorScheme.colors.background,
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 24
      }}>
        <View style={{
          padding: 24,
          borderRadius: 12,
          backgroundColor: theme.colorScheme.colors.card,
          width: '100%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4
        }}>
          <ActivityIndicator size="large" color={theme.colorScheme.colors.primary} />
          <Text style={{ 
            marginTop: 16, 
            color: theme.colorScheme.colors.text,
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Initializing app...
          </Text>
          <Text style={{
            marginTop: 8,
            color: theme.colorScheme.colors.text,
            opacity: 0.7,
            fontSize: 16,
            textAlign: 'center'
          }}>
            Please wait while we set things up
          </Text>
        </View>
      </View>
    );
  }

  // Show MainScreen if we have either a cached user or current user, and data is loaded
  if ((cachedUser || user) && dbInitialized && dataLoaded) {
    return <MainScreen initialData={userData} />;
  }

  // If no user and not loading, show login
  if (!loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colorScheme.colors.background }}>
        <LoginWrapper />
      </View>
    );
  }

  // During loading with no cache, show a blank screen with app background
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colorScheme.colors.background,
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 24
    }}>
      <View style={{
        padding: 24,
        borderRadius: 12,
        backgroundColor: theme.colorScheme.colors.card,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4
      }}>
        <ActivityIndicator size="large" color={theme.colorScheme.colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          color: theme.colorScheme.colors.text,
          fontSize: 20,
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Loading...
        </Text>
        <Text style={{
          marginTop: 8,
          color: theme.colorScheme.colors.text,
          opacity: 0.7,
          fontSize: 16,
          textAlign: 'center'
        }}>
          Getting your data ready
        </Text>
      </View>
    </View>
  );
}
