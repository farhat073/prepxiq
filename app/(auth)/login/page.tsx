"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ROLE_DASHBOARDS } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { demoProfiles } from "@/lib/demo-data";
import type { UserRole } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Animated geometric shapes for the background
function FloatingShape({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-2xl opacity-10 ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setProfile = useAppStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // First, try standard Supabase Auth
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        toast.error("Invalid credentials", {
          description: authError.message || "Please check your email and password.",
        });
        setIsLoading(false);
        return;
      }

      // Fetch the user's profile from the database
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        toast.error("Profile not found", {
          description: "Your user account exists but the profile record is missing. Please contact support.",
        });
        setIsLoading(false);
        return;
      }

      if (!profile.is_active) {
        toast.error("Account Deactivated", {
          description: "Your account has been deactivated. Please contact the administrator.",
        });
        // Sign them back out
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Set profile in Zustand store
      setProfile(profile as any);

      toast.success(`Welcome back, ${profile.full_name}!`, {
        description: `Logged in as ${profile.role}`,
      });

      // Redirect based on role
      const dashboard = ROLE_DASHBOARDS[profile.role as UserRole] || "/login";
      router.push(dashboard);
    } catch (error) {
      console.error(error);
      toast.error("Login Failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#111d36] to-[#0f2447]">
        {/* Floating Geometric Shapes */}
        <FloatingShape
          className="w-32 h-32 bg-blue-500 top-[15%] left-[10%] rotate-12"
          delay={0}
        />
        <FloatingShape
          className="w-24 h-24 bg-emerald-500 top-[60%] left-[20%] rotate-45"
          delay={1.5}
        />
        <FloatingShape
          className="w-40 h-40 bg-blue-400 top-[30%] right-[15%] -rotate-12"
          delay={0.5}
        />
        <FloatingShape
          className="w-20 h-20 bg-amber-500 bottom-[20%] right-[25%] rotate-[30deg]"
          delay={2}
        />
        <FloatingShape
          className="w-16 h-16 bg-purple-500 top-[10%] right-[35%] rotate-[60deg]"
          delay={3}
        />
        <FloatingShape
          className="w-28 h-28 bg-rose-500 bottom-[30%] left-[40%] -rotate-[20deg]"
          delay={1}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 to-transparent" />

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  PREPX <span className="text-blue-400">IQ</span>
                </h1>
                <p className="text-xs text-blue-300/70 tracking-widest uppercase">
                  ERP Platform
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Where Learning Meets
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>
            <p className="text-blue-200/60 text-lg max-w-md mx-auto leading-relaxed">
              The complete management platform for modern tuition centers.
              Manage students, teachers, batches, exams, and fees — all in one
              place.
            </p>
          </motion.div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 text-center"
          >
            {[
              { label: "Students", value: "1000+" },
              { label: "Teachers", value: "50+" },
              { label: "Success Rate", value: "95%" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-300/50">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                PREPX <span className="text-blue-500">IQ</span>
              </h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@prepxiq.com"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register("password")}
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked as boolean)
                }
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
