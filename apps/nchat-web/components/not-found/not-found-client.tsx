'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFoundClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Placeholder Image */}
        <div className="w-64 h-64 mx-auto relative">
          <img
            src="https://placehold.co/400x400/3b82f6/ffffff?text=404"
            alt="404 Illustration"
            className="w-full h-full object-contain rounded-2xl shadow-xl dark:shadow-primary/10"
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Oops! Page not found
          </h1>
          <p className="text-lg text-muted-foreground">
            The page youre looking for doesnt exist or has been moved.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => router.back()}
          size="lg"
          className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          ← Go Back
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
} 