import { useState } from "react";
import { useAuth } from "~/lib/core/contexts/AuthContext";
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
  
  // Use either the local state or the user's language preference from userInfo, or default to english
  const currentLanguage = localLanguage || userInfo?.language || "english";
  
  // Get the current language option
  const currentLanguageData = languageOptions.find(lang => lang.id === currentLanguage);

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === currentLanguage) return;
    
    console.log(`Changing language from ${currentLanguage} to ${newLanguage}`);
    setIsChanging(true);
    setLocalLanguage(newLanguage);
    
    try {
      if (updateLanguagePreference && userInfo) {
        // Only update language in backend and IndexedDB if user is logged in
        await updateLanguagePreference(newLanguage);
        console.log(`Language successfully changed to ${newLanguage}`);
      }
    } catch (error) {
      console.error("Failed to update language preference:", error);
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
            style={{
              width: 130,
              height: 36,
              backgroundColor: variant === "settings" ? "rgba(0, 0, 0, 0.05)" : "rgba(16, 185, 129, 0.2)",
              borderWidth: 0,
              borderRadius: variant === "settings" ? 6 : 9999,
            }}
            disabled={isChanging}
          >
            <View className="flex-row items-center gap-2">
              <Text style={{ color: variant === "default" ? "#ffffff" : undefined }}>
                {isChanging ? "Changing..." : currentLanguageData?.name || currentLanguage}
              </Text>
              <ChevronDown 
                size={18} 
                className={variant === "default" ? "text-white" : "text-foreground"} 
              />
            </View>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" insets={contentInsets} className="w-64 native:w-72">
          <DropdownMenuLabel>Select language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="gap-1">
            {languageOptions.map((language) => (
              <DropdownMenuItem
                key={language.id}
                onPress={() => handleLanguageChange(language.id)}
                className={cn(
                  "flex-col items-start gap-1",
                  currentLanguage === language.id ? "bg-secondary/70" : ""
                )}
              >
                <Text>{language.name}</Text>
                <Text className="text-xs text-muted-foreground">({language.nativeName})</Text>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
} 