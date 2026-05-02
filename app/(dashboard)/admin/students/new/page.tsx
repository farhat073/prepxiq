"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Save, User, BookOpen, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simplified Zod Schema for the Multi-step Form
const studentFormSchema = z.object({
  // Step 1: Personal Details
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  
  // Step 2: Academic Details
  school_name: z.string().min(2, "School name is required"),
  class_in_school: z.string().min(1, "Class is required"),
  level_id: z.string().min(1, "Level is required"),
  batch_id: z.string().min(1, "Batch is required"),
  
  // Step 3: Guardian Details
  father_name: z.string().min(2, "Father's name is required"),
  mother_name: z.string().min(2, "Mother's name is required"),
  guardian_phone: z.string().min(10, "Valid guardian phone is required"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const steps = [
  { id: "personal", title: "Personal Details", icon: User },
  { id: "academic", title: "Academic Info", icon: BookOpen },
  { id: "guardian", title: "Guardian Details", icon: UserPlus },
];

export default function AddStudentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: "", email: "", phone: "", date_of_birth: "", gender: "male",
      school_name: "", class_in_school: "", level_id: "", batch_id: "",
      father_name: "", mother_name: "", guardian_phone: "",
    },
    mode: "onChange",
  });

  const { register, handleSubmit, formState: { errors }, trigger, setValue, watch } = form;

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ["full_name", "email", "phone", "date_of_birth", "gender"];
    if (currentStep === 1) fieldsToValidate = ["school_name", "class_in_school", "level_id", "batch_id"];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      // Here we will eventually send to Supabase
      console.log("Submitting:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Student Added Successfully", {
        description: `${data.full_name} has been enrolled in the system.`,
      });
      router.push("/admin/students");
    } catch (error) {
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      <PageHeader 
        title="Add New Student" 
        subtitle="Enroll a new student into the academy."
      />

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/50 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : 
                isCompleted ? "bg-primary text-primary-foreground" : 
                "bg-card border-2 border-border text-muted-foreground"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`absolute -bottom-6 w-32 text-center text-xs font-medium transition-colors ${
                isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Area */}
      <div className="mt-12 bg-card border border-border/50 rounded-xl p-6 shadow-sm min-h-[400px] flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 1: Personal Details */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name <span className="text-destructive">*</span></Label>
                      <Input {...register("full_name")} placeholder="e.g. Aarav Patel" className={errors.full_name ? "border-destructive" : ""} />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address <span className="text-destructive">*</span></Label>
                      <Input {...register("email")} type="email" placeholder="e.g. aarav@example.com" className={errors.email ? "border-destructive" : ""} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number <span className="text-destructive">*</span></Label>
                      <Input {...register("phone")} placeholder="e.g. 9876543210" className={errors.phone ? "border-destructive" : ""} />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth <span className="text-destructive">*</span></Label>
                      <Input {...register("date_of_birth")} type="date" className={errors.date_of_birth ? "border-destructive" : ""} />
                      {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Gender <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(val) => setValue("gender", val as any)} defaultValue={watch("gender")}>
                        <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Info */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Previous/Current School Name <span className="text-destructive">*</span></Label>
                      <Input {...register("school_name")} placeholder="e.g. Delhi Public School" className={errors.school_name ? "border-destructive" : ""} />
                      {errors.school_name && <p className="text-xs text-destructive">{errors.school_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Class in School <span className="text-destructive">*</span></Label>
                      <Input {...register("class_in_school")} placeholder="e.g. Class 11" className={errors.class_in_school ? "border-destructive" : ""} />
                      {errors.class_in_school && <p className="text-xs text-destructive">{errors.class_in_school.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>PrepXIQ Level <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(val) => setValue("level_id", val as string)}>
                        <SelectTrigger className={errors.level_id ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="l1">Foundation (Class 8-10)</SelectItem>
                          <SelectItem value="l2">JEE Mains Targeted</SelectItem>
                          <SelectItem value="l3">NEET Targeted</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.level_id && <p className="text-xs text-destructive">{errors.level_id.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Assign Batch <span className="text-destructive">*</span></Label>
                      <Select onValueChange={(val) => setValue("batch_id", val as string)}>
                        <SelectTrigger className={errors.batch_id ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="b1">Foundation Alpha (Mon/Wed/Fri)</SelectItem>
                          <SelectItem value="b2">JEE Mains A (Tue/Thu/Sat)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.batch_id && <p className="text-xs text-destructive">{errors.batch_id.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3: Guardian Details */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Father&apos;s Name <span className="text-destructive">*</span></Label>
                      <Input {...register("father_name")} placeholder="e.g. Rajesh Patel" className={errors.father_name ? "border-destructive" : ""} />
                      {errors.father_name && <p className="text-xs text-destructive">{errors.father_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Mother&apos;s Name <span className="text-destructive">*</span></Label>
                      <Input {...register("mother_name")} placeholder="e.g. Meena Patel" className={errors.mother_name ? "border-destructive" : ""} />
                      {errors.mother_name && <p className="text-xs text-destructive">{errors.mother_name.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Guardian Primary Phone <span className="text-destructive">*</span></Label>
                      <Input {...register("guardian_phone")} placeholder="e.g. 9876543211" className={errors.guardian_phone ? "border-destructive" : ""} />
                      {errors.guardian_phone && <p className="text-xs text-destructive">{errors.guardian_phone.message}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? "Enrolling..." : "Complete Enrollment"}
                {!isSubmitting && <Save className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
