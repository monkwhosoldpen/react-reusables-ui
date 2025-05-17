import { useState, useEffect } from "react";
import { useInAppDB } from "~/lib/core/providers/InAppDBProvider";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "~/lib/icons/ChevronDown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useAuth } from "~/lib/core/contexts/AuthContext";

interface LanguageChangerProps {
  variant?: "default" | "settings";
  className?: string;
}

// Define language options directly in the component
const languageOptions = [
  { id: "english", name: "English", nativeName: "English" },
  { id: "hindi", name: "Hindi", nativeName: "हिन्दी" },
  { id: "telugu", name: "Telugu", nativeName: "తెలుగు" },
  { id: "tamil", name: "Tamil", nativeName: "தமிழ்" },
  { id: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { id: "malayalam", name: "Malayalam", nativeName: "മലയാളം" }
];

const contentInsets = {
  left: 12,
  right: 12,
};

export default function LanguageChanger({ variant = "default", className = "" }: LanguageChangerProps) {
  const { userInfo, updateLanguagePreference } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [localLanguage, setLocalLanguage] = useState<string | null>(null);
  const inAppDB = useInAppDB();
  
  // Get current language from the store or fallback to English
  const currentLanguage = userInfo?.id ? inAppDB.getUserLanguage(userInfo.id) || "english" : "english";
  
  // Get the current language option
  const currentLanguageData = languageOptions.find(lang => lang.id === currentLanguage);

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === currentLanguage) return;
    
    setIsChanging(true);
    setLocalLanguage(newLanguage);
    
    try {
      if (updateLanguagePreference && userInfo) {
        // Only update language in backend and IndexedDB if user is logged in
        await updateLanguagePreference(newLanguage);
      }
    } catch (error) {
      // Revert to previous language on error
      setLocalLanguage(userInfo?.language || "english");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <View className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === "settings" ? "outline" : "ghost"}
            size="sm"
            className={cn(
              "w-[130px] h-9",
              variant === "settings" 
                ? "bg-gray-100 dark:bg-gray-800 rounded-md" 
                : "bg-emerald-500/20 rounded-full"
            )}
            disabled={isChanging}
          >
            <View className="flex-row items-center gap-2">
              <Text className={cn(
                "font-medium",
                variant === "default" 
                  ? "text-white" 
                  : "text-gray-900 dark:text-white"
              )}>
                {isChanging ? "Changing..." : currentLanguageData?.name || currentLanguage}
              </Text>
              <ChevronDown 
                size={18} 
                className={cn(
                  variant === "default" 
                    ? "text-white" 
                    : "text-gray-900 dark:text-white"
                )} 
              />
            </View>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          insets={contentInsets} 
          className="w-64 native:w-72 bg-white dark:bg-gray-800"
        >
          <DropdownMenuLabel className="text-gray-900 dark:text-white">
            Select language
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="gap-1">
            {languageOptions.map((language) => (
              <DropdownMenuItem
                key={language.id}
                onPress={() => handleLanguageChange(language.id)}
                className={cn(
                  "flex-col items-start gap-1",
                  currentLanguage === language.id ? "bg-gray-700/50" : "",
                  "text-gray-900 dark:text-white"
                )}
              >
                <Text className="text-gray-900 dark:text-white">
                  {language.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  ({language.nativeName})
                </Text>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
} 