"use client";

import { AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const Icon = variant === "destructive" ? AlertCircle : HelpCircle;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader
          className={cn(
            "flex flex-row items-center gap-4 py-4",
            variant === "destructive"
              ? "bg-destructive/5"
              : variant === "warning"
                ? "bg-amber-500/5"
                : "bg-primary/5",
          )}
        >
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : variant === "warning"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4 pb-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-6 min-w-[100px]",
              variant === "default" && "shadow-lg shadow-primary/20",
              variant === "destructive" && "shadow-lg shadow-destructive/20",
            )}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
