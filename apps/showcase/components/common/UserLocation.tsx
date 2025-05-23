"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "~/lib/core/contexts/AuthContext"
import { useInAppDB } from "~/lib/core/providers/InAppDBProvider"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { toast } from "sonner"
import { Edit2, MapPin, Save, Trash2, Wand2, X } from "lucide-react-native"
import { Text, TextInput, NativeSyntheticEvent, TextInputChangeEventData } from "react-native"
import { LoginDialog } from "./LoginDialog"
import { config } from "~/lib/core/config"

// Define interface for user location data
interface UserLocationData {
  state: string;
  district: string;
  mp_constituency: string;
  assembly_constituency: string;
  mandal: string;
  village: string;
  ward: string;
  pincode: string;
  latitude: number;
  longitude: number;
  last_updated?: string;
  user_id?: string;
}

interface UserLocationFormData {
  state: string;
  district: string;
  mp_constituency: string;
  assembly_constituency: string;
  mandal: string;
  village: string;
  ward: string;
  pincode: string;
  latitude: string;
  longitude: string;
}

interface UserLocationProps {
  onValidityChange?: (isValid: boolean) => void;
}

export function UserLocation({ onValidityChange }: UserLocationProps = {}) {
  const { user, userInfo, refreshUserInfo } = useAuth()
  const inappDb = useInAppDB()
  const [location, setLocation] = useState<string>("")
  const [isEditing, setIsEditing] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [formData, setFormData] = useState<UserLocationFormData>({
    state: "",
    district: "",
    mp_constituency: "",
    assembly_constituency: "",
    mandal: "",
    village: "",
    ward: "",
    pincode: "",
    latitude: "",
    longitude: ""
  })
  const [loading, setLoading] = useState(false)

  // Fetch user location data on component mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user) return;

      try {
        // As a fallback, try to get location directly from InAppDB
        const userLocation = await inappDb.getUserLocation(user.id);
        if (userLocation) {
          updateFormWithLocation(userLocation);
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    fetchUserLocation();
  }, [user, userInfo, inappDb]);

  // Helper function to update form with location data
  const updateFormWithLocation = (locationData: UserLocationData | any) => {
    if (!locationData) return;
    
    setFormData({
      state: locationData.state || "",
      district: locationData.district || "",
      mp_constituency: locationData.mp_constituency || "",
      assembly_constituency: locationData.assembly_constituency || "",
      mandal: locationData.mandal || "",
      village: locationData.village || "",
      ward: locationData.ward || "",
      pincode: locationData.pincode || "",
      latitude: (locationData.latitude !== undefined ? locationData.latitude.toString() : ""),
      longitude: (locationData.longitude !== undefined ? locationData.longitude.toString() : "")
    });
    
    // Update location display string
    if (locationData.village && locationData.district && locationData.state) {
      setLocation(`${locationData.village}, ${locationData.district}, ${locationData.state}`);
      setIsEditing(false);
    }
  };

  // Check form validity whenever formData changes
  useEffect(() => {
    const isValid = Boolean(
      formData.state &&
      formData.district &&
      formData.village &&
      formData.latitude &&
      formData.longitude
    );
    onValidityChange?.(isValid);
  }, [formData, onValidityChange]);

  const handleEdit = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = async () => {
    if (!user) return;
   
    setIsEditing(false);
  };

  const handleSubmit = async (values: any) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const locationData = {
        user_id: user.id,
        state: values.state,
        district: values.district,
        mp_constituency: values.mp_constituency,
        assembly_constituency: values.assembly_constituency,
        mandal: values.mandal,
        village: values.village,
        ward: values.ward,
        pincode: values.pincode,
        latitude: values.latitude,
        longitude: values.longitude,
        last_updated: new Date().toISOString()
      };

      // Save to InAppDB
      await inappDb.setUserLocation(user.id, locationData);

      // Update backend
      const response = await fetch(config.api.endpoints.user.location, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          location: locationData
        }),
      });

      if (!response.ok) {
        console.warn("Backend update failed but InAppDB was updated");
        toast.error("Failed to update location on server");
      } else {
        toast.success("Location updated successfully");
      }

      // Even if API fails, we've saved to InAppDB
      return true;
    } catch (error) {
      toast.error("Failed to update location");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setFormData({
      state: "",
      district: "",
      mp_constituency: "",
      assembly_constituency: "",
      mandal: "",
      village: "",
      ward: "",
      pincode: "",
      latitude: "",
      longitude: ""
    });
    
    toast.success("Location fields cleared");
  };

  const handleTest = () => {
    const states = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Kerala"];
    const districts = ["Hyderabad", "Bangalore", "Chennai", "Kochi", "Vijayawada"];
    const constituencies = ["Constituency 1", "Constituency 2", "Constituency 3"];
    const mandals = ["Mandal 1", "Mandal 2", "Mandal 3"];
    const villages = ["Village 1", "Village 2", "Village 3"];
    const wards = ["Ward 1", "Ward 2", "Ward 3"];

    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
    const randomConstituency = constituencies[Math.floor(Math.random() * constituencies.length)];
    const randomMandal = mandals[Math.floor(Math.random() * mandals.length)];
    const randomVillage = villages[Math.floor(Math.random() * villages.length)];
    const randomWard = wards[Math.floor(Math.random() * wards.length)];
    const randomPincode = Math.floor(100000 + Math.random() * 900000).toString();
    const randomLatitude = (Math.random() * 180 - 90).toFixed(6);
    const randomLongitude = (Math.random() * 360 - 180).toFixed(6);

    setFormData({
      state: randomState,
      district: randomDistrict,
      mp_constituency: randomConstituency,
      assembly_constituency: randomConstituency,
      mandal: randomMandal,
      village: randomVillage,
      ward: randomWard,
      pincode: randomPincode,
      latitude: randomLatitude,
      longitude: randomLongitude
    });

    toast.success("Test data filled");
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // After successful login, we can proceed with editing
    setIsEditing(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          {isEditing && user ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Edit Location</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onPress={handleTest}>
                    <Wand2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onPress={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onPress={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onPress={handleSubmit}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Text>State</Text>
                  <Input
                    value={formData.state}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>District</Text>
                  <Input
                    value={formData.district}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>MP Constituency</Text>
                  <Input
                    value={formData.mp_constituency}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, mp_constituency: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Assembly Constituency</Text>
                  <Input
                    value={formData.assembly_constituency}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, assembly_constituency: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Mandal</Text>
                  <Input
                    value={formData.mandal}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, mandal: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Village</Text>
                  <Input
                    value={formData.village}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, village: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Ward</Text>
                  <Input
                    value={formData.ward}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, ward: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Pincode</Text>
                  <Input
                    value={formData.pincode}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Latitude</Text>
                  <Input
                    value={formData.latitude}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, latitude: text }))}
                  />
                </div>
                <div className="space-y-2">
                  <Text>Longitude</Text>
                  <Input
                    value={formData.longitude}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, longitude: text }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <Text>{location || "No location set"}</Text>
              </div>
              <Button variant="ghost" size="sm" onPress={handleEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showLoginDialog && (
        <LoginDialog 
          isOpen={showLoginDialog} 
          onOpenChange={setShowLoginDialog} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
} 