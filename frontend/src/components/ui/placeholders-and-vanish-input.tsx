"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { Input } from "./input";

interface VanishInputContextProps {
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  value: string;
}

const VanishInputContext = createContext<VanishInputContextProps | undefined>(
  undefined
);

export const VanishInputProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);
  return (
    <VanishInputContext.Provider value={{ onFocus, onBlur, isFocused, value }}>
      {children}
    </VanishInputContext.Provider>
  );
};

export const useVanishInput = () => {
  const context = useContext(VanishInputContext);
  if (!context) {
    throw new Error("useVanishInput must be used within a VanishInputProvider");
  }
  return context;
};

export const PlaceholdersAndVanishInput = ({
  placeholders,
  onChange,
  onSubmit,
  value,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  value: string;
}) => {
  return (
    <VanishInputProvider value={value}>
      <VanishInput
        placeholders={placeholders}
        onChange={onChange}
        onSubmit={onSubmit}
        value={value}
      />
    </VanishInputProvider>
  );
};

const VanishInput = ({
  placeholders,
  onChange,
  onSubmit,
  value,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  value: string;
}) => {
  const { onFocus, onBlur, isFocused } = useVanishInput();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      // Directly call onSubmit with a synthetic event
      const form = e.currentTarget.form;
      if (form) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(e);
      }}
    >
      <div className={cn("relative w-full z-40")}>
        <div className="relative">
          <Placeholders placeholders={placeholders} />
          <Input
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            type="text"
            className="w-full text-base bg-card/50 backdrop-blur-sm h-12 relative z-10"
            aria-label="Topic input"
          />
        </div>
      </div>
    </form>
  );
};

const Placeholders = ({
  placeholders,
}: {
  placeholders: string[];
}) => {
  const { isFocused, value } = useVanishInput();
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isFocused && !value) {
      interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [placeholders.length, isFocused, value]);

  const showPlaceholders = !isFocused && !value;

  return (
    <AnimatePresence>
      {showPlaceholders && (
        <motion.div
          key={"placeholder"}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: "linear" }}
          className="absolute inset-0 flex items-center px-3 pointer-events-none"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={placeholders[currentPlaceholder]}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="text-foreground/50 text-sm"
            >
              {placeholders[currentPlaceholder]}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
