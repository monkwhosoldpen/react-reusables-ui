import React from 'react';
import { View, Text, ScrollView, Pressable, Image, useWindowDimensions } from 'react-native';
import { cn } from '~/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { APIGoat } from '~/lib/types/goat';

type GoatSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGoats?: Set<string>;
  onSelectGoat: (goatId: string) => void;
  onCancel: () => void;
  onSave: () => void;
  goats: APIGoat[];
};

export const GoatSelectionDialog = React.memo(({ 
  open, 
  onOpenChange,
  selectedGoats,
  onSelectGoat,
  onCancel,
  onSave,
  goats
}: GoatSelectionDialogProps) => {
  const { width } = useWindowDimensions();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 overflow-hidden" 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: width,
          maxHeight: '80%',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          margin: 0,
        }}
      >
        <View className="flex-1">
          <View className="p-4 border-b border-border">
            <DialogHeader>
              <DialogTitle>Select Goats</DialogTitle>
              <Text className="text-sm text-muted-foreground mt-1">
                Choose goats to create a new tab
              </Text>
            </DialogHeader>
          </View>

          <ScrollView className="max-h-[60vh]">
            <View className="p-4 gap-2">
              {goats.map((goat) => (
                <Pressable
                  key={goat.uid}
                  onPress={() => onSelectGoat(goat.uid)}
                  className={cn(
                    "flex-row items-center p-3 rounded-lg border",
                    selectedGoats?.has(goat.uid) ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  <Image
                    source={{ uri: goat.img_url }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-medium text-foreground">
                      {goat.metadata_with_translations.name.english}
                    </Text>
                    <Text className="text-sm text-muted-foreground">{goat.category}</Text>
                  </View>
                  {selectedGoats?.has(goat.uid) && (
                    <View className="h-6 w-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-primary-foreground">✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View className="p-4 border-t border-border">
            <View className="flex-row justify-end gap-2">
              <Button variant="outline" onPress={onCancel}>
                <Text>Cancel</Text>
              </Button>
              <Button onPress={onSave} disabled={selectedGoats?.size === 0}>
                <Text>Create Tab</Text>
              </Button>
            </View>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}); 