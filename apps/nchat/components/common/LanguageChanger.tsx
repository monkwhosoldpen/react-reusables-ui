import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select";
import { Text } from "react-native";

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

export default function LanguageChanger({ variant = "default", className = "" }: LanguageChangerProps) {
  const { userInfo, updateLanguagePreference } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [localLanguage, setLocalLanguage] = useState<string | null>(null);
  
  // Use either the local state or the user's language preference from userInfo, or default to english
  const currentLanguage = localLanguage || userInfo?.language || "english";
  
  // Get the current language option
  const currentLanguageData = languageOptions.find(lang => lang.id === currentLanguage);

  // Convert to Option type
  const currentLanguageOption: Option = {
    value: currentLanguage,
    label: currentLanguageData?.name || currentLanguage
  };

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

  // Different styling based on variant
  const triggerClassName = variant === "settings" 
    ? "w-[130px] h-9 bg-muted/50 border-none rounded-md focus:ring-offset-0 focus:ring-0" 
    : "w-[130px] h-9 bg-emerald-500/20 dark:bg-emerald-700/40 text-white border-none rounded-full focus:ring-offset-0 focus:ring-0";

  return (
    <div className={className}>
      <Select 
        value={currentLanguageOption}
        onValueChange={(option: Option) => {
          if (option) {
            handleLanguageChange(option.value);
          }
        }}
        disabled={isChanging}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Select language">
            <div className="flex items-center">
              {isChanging ? (
                <span className={variant === "default" ? "text-white" : ""}>Changing...</span>
              ) : (
                <span className={variant === "default" ? "text-white" : ""}>{currentLanguageOption.label}</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          {languageOptions.map((language) => (
            <SelectItem 
              key={language.id} 
              value={language.id}
              label={language.name}
              className="hover:bg-muted focus:bg-muted"
            >
              <div className="flex items-center">
                <span>{language.name}</span>
                <span className="text-xs text-muted-foreground ml-1">({language.nativeName})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 