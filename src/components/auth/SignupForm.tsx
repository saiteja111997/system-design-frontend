"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SignupFormProps {
  onClose: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function SignupForm({ onClose, loading, setLoading }: SignupFormProps) {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signUpWithEmail(
        signupData.email,
        signupData.password,
        signupData.fullName
      );
      toast.success("Account created! Please check your email to verify.");
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" };
    if (password.length < 6)
      return { strength: 1, text: "Weak", color: "text-red-500" };
    if (password.length < 10)
      return { strength: 2, text: "Fair", color: "text-yellow-500" };
    return { strength: 3, text: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  return (
    <div className="space-y-5">
      <Button
        variant="outline"
        className="w-full h-10 text-sm font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-200"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-slate-500 dark:text-slate-400 font-medium">
            Or create your account
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="signup-name"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Full name
          </Label>
          <div className="relative mt-1">
            <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              className="pl-10 h-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
              value={signupData.fullName}
              onChange={(e) =>
                setSignupData({ ...signupData, fullName: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              className="pl-10 h-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="signup-password"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="pl-10 pr-12 h-10 border-2 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {signupData.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password strength:</span>
                <span className={`font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    passwordStrength.strength === 1
                      ? "bg-red-500 w-1/3"
                      : passwordStrength.strength === 2
                      ? "bg-yellow-500 w-2/3"
                      : passwordStrength.strength === 3
                      ? "bg-green-500 w-full"
                      : "w-0"
                  }`}
                />
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle
                className={`w-3 h-3 ${
                  signupData.password.length >= 6
                    ? "text-green-500"
                    : "text-slate-300"
                }`}
              />
              At least 6 characters
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          By creating an account, you agree to our{" "}
          <a
            href="#"
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Privacy Policy
          </a>
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating account...
            </div>
          ) : (
            "Create your account"
          )}
        </Button>
      </form>
    </div>
  );
}
