import { useEffect, useState } from "react";

/**
 * Custom hook to load a font file and convert it to base64
 * @param fontPath Path to the font file
 * @returns Object containing the base64 encoded font and loading state
 */
export function useFontLoader(fontPath: string) {
  const [fontBase64, setFontBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFont = async () => {
      try {
        setIsLoading(true);
        // Fetch the font file
        const response = await fetch(fontPath);
        const blob = await response.blob();

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setFontBase64(base64.split(",")[1] ?? null);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError(new Error("Failed to read font file"));
          setIsLoading(false);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load font:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
        setIsLoading(false);
      }
    };

    void loadFont();
  }, [fontPath]);

  return { fontBase64, isLoading, error };
}
