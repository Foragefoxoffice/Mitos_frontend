"use client";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
      <div className="animate-pulse text-foreground">Loading...</div>
    </div>
  );
}