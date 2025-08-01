"use client";

import { XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  actionLabel?: string;
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = "Erro",
  message,
  actionLabel = "Tentar Novamente",
}: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-red-600">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {actionLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
