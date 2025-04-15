import { Stack } from "expo-router";
import React from "react";
import { CommonHeader } from "~/components/CommonHeader";

export default function ExploreLayout() {
  const hasMounted = React.useRef(false);

  return (
    <>
      <Stack
        initialRouteName='index'
        screenOptions={{
          header: ({ navigation, route, options }) => (
            <CommonHeader
              title="Dashboard"
              showBackButton={navigation.canGoBack()}
              onBackPress={() => navigation.goBack()}
            />
          ),
        }}
      >
        <Stack.Screen
          name='index'
          options={{
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}