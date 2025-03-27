import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useAuth } from '~/lib/providers/auth/AuthProvider';
import { SignInModal } from './modals/SignInModal';
import { ChevronRight } from '~/lib/icons/ChevronRight';

type UserMenuProps = {
  showAsButton?: boolean;
};

export function UserMenu({ showAsButton }: UserMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showSignInModal, setShowSignInModal] = React.useState(false);

  if (showAsButton) {
    return (
      <>
        <Pressable
          onPress={() => isAuthenticated ? undefined : setShowSignInModal(true)}
          className="flex-row items-center justify-between py-2 active:opacity-70"
        >
          <View className="flex-row items-center gap-3">
            <Avatar className="h-10 w-10" alt="">
              {isAuthenticated ? (
                <AvatarImage source={{ uri: user?.avatarUrl }} />
              ) : (
                <AvatarImage source={{ uri: 'https://ui-avatars.com/api/?background=random' }} />
              )}
              <AvatarFallback>
                <Text>{user?.username?.[0] ?? '?'}</Text>
              </AvatarFallback>
            </Avatar>
            <View>
              <Text className="font-medium">
                {isAuthenticated ? user?.username : 'Sign In'}
              </Text>
              {isAuthenticated && (
                <Text className="text-sm text-muted-foreground">
                  {user?.email}
                </Text>
              )}
            </View>
          </View>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Pressable>

        <SignInModal 
          open={showSignInModal} 
          onOpenChange={setShowSignInModal} 
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8" alt="">
            {isAuthenticated ? (
              <AvatarImage source={{ uri: user?.avatarUrl }} />
            ) : (
              <AvatarImage source={{ uri: 'https://ui-avatars.com/api/?background=random' }} />
            )}
            <AvatarFallback>
              <Text>{user?.username?.[0] ?? '?'}</Text>
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            {isAuthenticated ? (
              <>
                <DropdownMenuItem className="gap-3">
                  <View>
                    <Text className="font-medium">{user?.username}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {user?.email}
                    </Text>
                  </View>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onPress={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <Text>Sign out</Text>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onPress={() => setShowSignInModal(true)}>
                <Text>Sign in</Text>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal} 
      />
    </>
  );
} 