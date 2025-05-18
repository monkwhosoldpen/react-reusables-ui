"use client";

import { useState, useEffect, useCallback } from "react";
import { Channel, ChannelResponse } from "~/lib/core/types/channel.types";
import { config } from "~/lib/core/config";
import { FormDataType } from "~/lib/enhanced-chat/types/superfeed";
import { useAuth } from "../contexts/AuthContext";

export type AccessStatus = "NONE" | "PARTIAL" | "FULL" | string;

interface UseChannelDataReturn {
  channel: Channel | null;
  loading: boolean;
  error: string | null;
  messages: FormDataType[];
  loadingMessages: boolean;
  messageError: string | null;
  accessStatus: AccessStatus;
  refreshMessages: () => Promise<void>;
}

/**
 * React hook to fetch channel details and the first page of messages for a given username.
 * @param usernameStr channel username (without @)
 * @param refreshKey optional key that forces a refetch when its value changes
 */
export default function useChannelData(
  usernameStr: string,
  refreshKey = 0
): UseChannelDataReturn {
  const { user } = useAuth();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<FormDataType[]>([]);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("NONE");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageError, setMessageError] = useState<string | null>(null);

  const userId = user?.id ?? "";
  const baseUrl = config.api.endpoints.channels.base;

  const fetchMessages = useCallback(async () => {
    if (!usernameStr) return;

    setLoadingMessages(true);
    try {
      const res = await fetch(
        `${baseUrl}/${usernameStr}/messages?page_size=20&user_id=${userId}`
      );

      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? `Messages for @${usernameStr} not found`
            : "Failed to fetch channel messages"
        );
      }

      const { messages = [], access_status = "NONE" } = await res.json();
      setMessages(messages);
      setAccessStatus(access_status);
      setMessageError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load messages";
      setMessageError(msg);
    } finally {
      setLoadingMessages(false);
    }
  }, [usernameStr, userId, baseUrl]);

  const fetchChannel = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/${usernameStr}`);
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? `Channel @${usernameStr} not found`
            : "Failed to fetch channel details"
        );
      }

      const data: ChannelResponse = await res.json();
      setChannel(data.mainChannel);
      setError(null);

      // Fetch messages after channel detail is fetched
      await fetchMessages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load channel";
      setError(msg);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, [usernameStr, baseUrl, fetchMessages]);

  // initial & refresh-key driven load
  useEffect(() => {
    fetchChannel();
  }, [fetchChannel, refreshKey]);

  return {
    channel,
    loading,
    error,
    messages,
    loadingMessages,
    messageError,
    accessStatus,
    refreshMessages: fetchMessages,
  };
}
