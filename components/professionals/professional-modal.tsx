"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfessionalForm } from "./professional-form"

interface ProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  initialData?: {
    name: string
    phone: string
    company: string
  }
  onSubmit: (data: {
    name: string
    phone: string
    company: string
  }) => Promise<void>
}

export function ProfessionalModal({
  isOpen,
  onClose,
  title,
  description,
  initialData,
  onSubmit,
}: ProfessionalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProfessionalForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
