"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/contexts/workspace-context";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name must be at most 50 characters"),
  key: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must be at most 10 characters")
    .regex(/^[A-Z0-9]+$/, "Project key must be uppercase letters and numbers only"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace, addProject } = useWorkspace();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Add project to context
      addProject({
        id: `${Date.now()}`,
        name: values.name,
        key: values.key,
        description: values.description || "",
        workspaceId: currentWorkspace?.id || "1",
      });

      // Reset form and close dialog
      form.reset();
      setIsLoading(false);
      setOpen(false);
    }, 1000);
  };

  // Auto-generate key from name
  const handleNameChange = (value: string) => {
    // Only auto-fill key if it's empty
    if (!form.getValues("key")) {
      const generatedKey = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 10);
      form.setValue("key", generatedKey);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm font-normal"
        >
          <Plus className="h-4 w-4" />
          Create project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Add a new project to {currentWorkspace?.name || "your workspace"}. Fill in the details
            below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome Project"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your project. This will be visible to all team members.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Key */}
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Key *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MAP"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        field.onChange(value);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your project (e.g., MAP for My Awesome Project).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your project..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Provide a brief description of the project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
