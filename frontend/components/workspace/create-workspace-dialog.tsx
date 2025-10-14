"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/contexts/workspace-context";
import { cn } from "@/lib/utils";

// Step 1: Workspace details
const workspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(50, "Workspace name must be at most 50 characters"),
});

// Step 2: Project details
const projectSchema = z.object({
  projectName: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name must be at most 50 characters"),
  projectKey: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(10, "Project key must be at most 10 characters")
    .regex(/^[A-Z0-9]+$/, "Project key must be uppercase letters and numbers only"),
});

// Combined schema
const formSchema = workspaceSchema.merge(projectSchema);

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  {
    id: 1,
    title: "Workspace Details",
    description: "Create a new workspace",
  },
  {
    id: 2,
    title: "First Project",
    description: "Set up your first project",
  },
];

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addWorkspace, addProject } = useWorkspace();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceName: "",
      projectName: "",
      projectKey: "",
    },
    mode: "onChange",
  });

  const progress = (currentStep / STEPS.length) * 100;

  // Auto-generate project key from name
  const handleProjectNameChange = (value: string) => {
    if (!form.getValues("projectKey")) {
      const generatedKey = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 10);
      form.setValue("projectKey", generatedKey);
    }
  };

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      // Validate workspace fields
      isValid = await form.trigger(["workspaceName"]);
    } else if (currentStep === 2) {
      // Validate project fields
      isValid = await form.trigger(["projectName", "projectKey"]);
    }

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const workspaceId = `workspace-${Date.now()}`;

      // Step 1: Add workspace
      addWorkspace({
        id: workspaceId,
        name: values.workspaceName,
        icon: "🚀",
      });

      // Step 2: Add first project to the workspace
      addProject({
        id: `project-${Date.now()}`,
        name: values.projectName,
        key: values.projectKey,
        workspaceId: workspaceId,
      });

      // Reset and close
      form.reset();
      setCurrentStep(1);
      setIsLoading(false);
      setOpen(false);
    }, 1500);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset form and step when closing
      form.reset();
      setCurrentStep(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm font-normal"
        >
          <Plus className="h-4 w-4" />
          Create workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {STEPS[currentStep - 1].title}
            {currentStep === STEPS.length && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-12 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Workspace Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Corporation"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your workspace. This will be visible to all members.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My First Project"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleProjectNameChange(e.target.value);
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your first project in this workspace.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Key *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MFP"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                            field.onChange(value);
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for your project (e.g., MFP for My First Project).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Workspace
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
