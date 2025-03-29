"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Home, Star, ShoppingBag, Briefcase, Newspaper } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"
import { FollowButton } from "@/components/common/FollowButton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { UserLocation } from "@/components/common/UserLocation"

// Define the Channel type
interface Channel {
  username: string
  is_premium?: boolean
  role?: string
  type?: string
  stateName?: string
  assemblyName?: string
  isFollowing?: boolean
}

export default function SuperMenuPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("home")
  const { user, userInfo } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load channels data when the component mounts
  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/channels")

        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setChannels(data)
        } else if (data.success) {
          setChannels(data.channels)
        } else {
          throw new Error(data.error || "Failed to fetch channels")
        }
      } catch (error) {
        setError("Failed to load channels. Please try again.")
        toast.error("Failed to load channels")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [])

  // Define main navigation tabs
  const navigationTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "store", label: "Store", icon: ShoppingBag },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "news", label: "News", icon: Newspaper },
  ]

  // Define channel categories (for Home tab)
  const channelCategories = [
    { id: "all", label: "all", icon: Home },
    { id: "premium", label: "premium", icon: Star },
  ]

  // Memoize the filtered channels to prevent recalculation on every render
  const filteredChannels = useMemo(() => {
    // Check if channels array is valid
    if (!channels || channels.length === 0) {
      return []
    }

    // Ensure all channels have the is_premium property set
    const processedChannels = channels.map((channel) => {
      // If is_premium is undefined, set it based on username
      if (channel.is_premium === undefined) {
        // These usernames are known to be premium
        const isPremium = channel.username === "janedoe" || channel.username === "elonmusk"
        return { ...channel, is_premium: isPremium }
      }
      return channel
    })

    // Check for premium channels
    const premiumChannels = processedChannels.filter((channel) => channel.is_premium)

    return processedChannels.filter((channel) => {
      // Filter by category
      if (selectedCategory === "all") {
        // Show all channels
      } else if (selectedCategory === "premium") {
        if (!channel.is_premium) return false
      } else if (channel.role !== selectedCategory) {
        return false
      }

      // Filter by search query
      if (searchQuery && !channel.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      return true
    })
  }, [channels, selectedCategory, searchQuery])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Main tabs skeleton */}
        <div className="sticky top-0 z-10">
          <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800 py-2">
            <div className="container overflow-x-auto no-scrollbar">
              <div className="flex gap-2 min-w-full px-1">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-md bg-gray-200 dark:bg-gray-700/50" />
                ))}
              </div>
            </div>
          </div>

          {/* Search skeleton */}
          <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800">
            <div className="container py-4">
              <div className="relative w-full max-w-md mx-auto">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Skeleton className="w-full h-10 rounded-full bg-gray-200/50 dark:bg-gray-700/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4 text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            There was a problem loading the channels. This could be due to a network issue or the server might be
            unavailable.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  // Helper function to check if user is following a channel
  const isUserFollowing = (channel: Channel) => {
    return (
      [].some(
        (followedChannel: any) =>
          (typeof followedChannel === "string" && followedChannel === channel.username) ||
          (typeof followedChannel === "object" && followedChannel.username === channel.username),
      ) || false
    )
  }

  // Render channel avatar
  const renderChannelAvatar = (channel: Channel, size = 16) => (
    <div className="relative">
      <img
        src={`https://placehold.co/100x100/emerald/white?text=${channel.username.substring(0, 2).toUpperCase()}`}
        alt={channel.username}
        className={`w-${size} h-${size} rounded-full bg-emerald-100 object-cover`}
      />
      {channel.is_premium && (
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900" />
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* User Location */}
      <div className="container py-2">
        <UserLocation />
      </div>

      {/* Main Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800">
        <div className="container py-2">
          <div className="flex justify-between overflow-x-auto no-scrollbar">
            {navigationTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "flex-1 rounded-none border-b-2 px-0 py-2 h-auto text-sm font-medium",
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar - Common for all tabs */}
      <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800">
        <div className="container py-4">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                className="pl-10 w-full rounded-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Search channels"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab-specific content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "home" && (
          <>
            {/* Home Tab Categories */}
            <div className="bg-background dark:bg-background border-b border-gray-200 dark:border-gray-800 py-2">
              <div className="container overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-full px-1">
                  {channelCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={cn(
                        "rounded-full px-4 py-2 h-auto text-sm font-medium",
                        selectedCategory === category.id
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                      )}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Home Tab Channel Grid */}
            <div className="container py-4 px-3 md:px-4">
              {filteredChannels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No channels found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredChannels.map((channel, index) => (
                    <div
                      key={`${channel.username}-${index}`}
                      className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                    >
                      <div className="p-3">
                        <div className="flex flex-col space-y-3">
                          {/* Avatar and Premium Badge */}
                          <div className="flex justify-center mb-1">{renderChannelAvatar(channel)}</div>

                          {/* Username and Location */}
                          <div className="text-center">
                            <Link href={`/${channel.username}`}>
                              <h3
                                className={cn(
                                  "font-medium truncate text-sm",
                                  channel.is_premium ? "text-yellow-500 dark:text-yellow-400" : "",
                                )}
                              >
                                @{channel.username}
                              </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {channel.stateName} {channel.assemblyName ? `• ${channel.assemblyName}` : ""}
                            </p>
                          </div>

                          {/* Follow Button */}
                          <div className="flex justify-center pt-1">
                            <FollowButton
                              username={channel.username}
                              size="sm"
                              className="text-xs h-8 min-w-[80px]"
                              initialFollowing={isUserFollowing(channel)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "store" && (
          <div className="container py-6 px-3 md:px-4">
            <h2 className="text-2xl font-bold mb-6">Channel Store</h2>
            {filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No products found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map((channel, index) => (
                  <Card key={`${channel.username}-${index}`} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center">
                      {renderChannelAvatar(channel, 24)}
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/${channel.username}`}>
                          <h3 className="font-semibold text-lg">@{channel.username}</h3>
                        </Link>
                        {channel.is_premium && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                          >
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {channel.stateName} {channel.assemblyName ? `• ${channel.assemblyName}` : ""}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm">
                        Subscribe to {channel.username}s premium content and get exclusive updates.
                      </p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">{channel.is_premium ? "$9.99/mo" : "Free"}</span>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-4 w-4",
                                    star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600",
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs ml-1 text-muted-foreground">(4.0)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                        Subscribe
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div className="container py-6 px-3 md:px-4">
            <h2 className="text-2xl font-bold mb-6">Channel Services</h2>
            {filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No services found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredChannels.map((channel, index) => (
                  <Card key={`${channel.username}-${index}`} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 p-6 flex items-center justify-center">
                        {renderChannelAvatar(channel, 20)}
                      </div>
                      <div className="md:w-3/4 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/${channel.username}`}>
                              <h3 className="font-semibold text-xl">
                                {channel.is_premium && <span className="inline-block mr-2 text-yellow-500">⭐</span>}
                                {channel.username} Services
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {channel.stateName} {channel.assemblyName ? `• ${channel.assemblyName}` : ""}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            {channel.is_premium ? "Premium" : "Standard"}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4">
                          Professional services offered by {channel.username}. Get expert assistance and support.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">Consulting</Badge>
                          <Badge variant="outline">Support</Badge>
                          <Badge variant="outline">Training</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            Starting at {channel.is_premium ? "$49.99/hr" : "$19.99/hr"}
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Learn More
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "news" && (
          <div className="container py-6 px-3 md:px-4">
            <h2 className="text-2xl font-bold mb-6">Channel News</h2>
            {filteredChannels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Newspaper className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No news found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredChannels.map((channel, index) => {
                  // Generate random date for news articles
                  const date = new Date()
                  date.setDate(date.getDate() - Math.floor(Math.random() * 7))
                  const formattedDate = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  return (
                    <div
                      key={`${channel.username}-${index}`}
                      className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0"
                    >
                      <div className="flex gap-4">
                        <div className="hidden sm:block">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                            {renderChannelAvatar(channel, 12)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/${channel.username}`}>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {channel.username}
                              </span>
                            </Link>
                            {channel.is_premium && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0 h-5 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/30"
                              >
                                Premium
                              </Badge>
                            )}
                          </div>
                          <Link href={`/${channel.username}`}>
                            <h3 className="text-xl font-bold mb-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                              Latest updates from {channel.username}s channel
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {channel.username} shares new content and insights about{" "}
                            {channel.stateName || "their expertise"}.
                            {channel.assemblyName ? ` Updates from ${channel.assemblyName} included.` : ""}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formattedDate} • 5 min read
                            </span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                Share
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

