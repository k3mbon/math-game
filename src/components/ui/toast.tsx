import * as React from "react"
import { type ToastProps, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const Toaster = ToastProvider

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=start]:translate-x-[var(--radix-toast-swipe-start-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:fade-in-100 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends React.ComponentPropsWithoutRef<typeof Toast>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<React.ElementRef<typeof Toast>,
  ToastProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <Toast
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Toast.displayName = Toast.displayName

const ToastAction = React.forwardRef<React.ElementRef<typeof ToastAction>,
  React.ComponentPropsWithoutRef<typeof ToastAction>>(
  ({ className, ...props }, ref) => (
    <ToastAction
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:pointer-events-none data-[state=active]:bg-foreground data-[state=active]:text-background",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = ToastAction.displayName

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastClose>,
  React.ComponentPropsWithoutRef<typeof ToastClose>>(
  ({ className, ...props }, ref) => (
    <ToastClose
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastClose>
  )
)
ToastClose.displayName = ToastClose.displayName

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastTitle>,
  React.ComponentPropsWithoutRef<typeof ToastTitle>>(
  ({ className, ...props }, ref) => (
    <ToastTitle
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
)
ToastTitle.displayName = ToastTitle.displayName

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastDescription>,
  React.ComponentPropsWithoutRef<typeof ToastDescription>>(
  ({ className, ...props }, ref) => (
    <ToastDescription
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
)
ToastDescription.displayName = ToastDescription.displayName

export {
  Toaster,
  Toast,
  ToastProvider,
  ToastViewport,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  toastVariants,
}