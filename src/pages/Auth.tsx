import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from "lucide-react";

import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    const hasValidDomain = email.includes("@") && email.split("@")[1]?.includes(".");
    const isCommonDomain = /\.(com|org|net|edu|gov|mil|co\.uk|co|io|ai|app)$/i.test(email);
    
    return {
      isValid: isValid && hasValidDomain,
      hasValidDomain,
      isCommonDomain,
      feedback: !email ? "" : 
                !isValid ? "Invalid email format" :
                !hasValidDomain ? "Email must include a valid domain" :
                !isCommonDomain ? "Consider using a more common domain" : "Valid email"
    };
  };

  const emailValidation = validateEmail(formData.email);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.special) score += 20;

    const strength = score >= 80 ? "Strong" : score >= 60 ? "Medium" : score >= 40 ? "Fair" : "Weak";
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
    
    return { score, strength, color, checks };
  };

  const passwordValidation = getPasswordStrength(formData.password);

  const headline = useMemo(() => {
    if (mode === "login") return "Welcome Back";
    return "Create your Sield account";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "login") {
      return "Sign in to access your secure document dashboard";
    }
    return "Start with email/password, then connect a wallet when you're ready";
  }, [mode]);

  useEffect(() => {
    const checkExisting = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };

    checkExisting();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Additional validation for signup mode
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please ensure both passwords are identical",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (passwordValidation.score < 60) {
          toast({
            title: "Password is too weak",
            description: "Please choose a stronger password with at least medium strength",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const validationData = mode === "signup" 
        ? signupSchema.parse(formData)
        : loginSchema.parse(formData);

      if (mode === "signup") {
        console.log('[auth] Starting signup process...');
        
        // FIXED: Remove redirect_to when email confirmation is disabled
        const signupData = {
          email: validationData.email,
          password: validationData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
            // REMOVED: emailRedirectTo - this causes 401 when email confirmation is disabled
          },
        };

        console.log('[auth] Signup data:', { ...signupData, password: '[HIDDEN]' });

        const { data, error } = await supabase.auth.signUp(signupData);

        console.log('[auth] Signup response:', { data, error });

        if (error) {
          console.error('[auth] Signup error:', error);
          if (error.message.includes("already registered")) {
            toast({
              title: "Email already registered",
              description: "This email is already registered. Try logging in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        // FIXED: Since email confirmation is disabled, we should get a session immediately
        if (data.session) {
          console.log('[auth] Signup successful, session created');
          toast({
            title: "Account created successfully!",
            description: "Welcome to Sield. Redirecting to dashboard...",
          });
          
          // Clear form and redirect
          setFormData({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          
          // Small delay to show success message
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
          return;
        }

        // If no session but no error (edge case)
        toast({
          title: "Account created",
          description: "Please try logging in.",
        });
        setMode("login");
        return;
      }

      // Login logic
      console.log('[auth] Starting login process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validationData.email,
        password: validationData.password,
      });

      console.log('[auth] Login response:', { data, error });

      if (error) {
        console.error('[auth] Login error:', error);
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else if (error.message.includes("Invalid email")) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.session) {
        console.log('[auth] Login successful, redirecting to dashboard');
        toast({
          title: "Welcome back!",
          description: "Redirecting to dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error('[auth] Unexpected error:', err);
      if (err instanceof z.ZodError) {
        toast({
          title: "Please check your details",
          description: err.errors[0]?.message ?? "Invalid input",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden border-r border-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-secondary/70" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0iIzAwQjhEOSIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-11 w-11 text-secondary" />
            <span className="text-4xl font-bold tracking-tight">Sield</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Secure legal documents,
            <span className="text-secondary block">with audit-grade proof</span>
          </h1>

          <p className="text-lg text-primary-foreground/85 mb-8 leading-relaxed">
            Email authentication for enterprise teams. Web3 wallet verification for blockchain operations.
            Select the authentication method that aligns with your workflow requirements — wallet integration available anytime.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-base text-primary-foreground/90">
                One-time secure viewing, enforced in the browser
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-base text-primary-foreground/90">
                Client-side encryption + decentralized storage
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-base text-primary-foreground/90">
                Immutable audit trail on BlockDAG
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-primary-foreground/15">
            <div>
              <div className="text-3xl font-bold text-secondary">AES-256</div>
              <div className="text-primary-foreground/70 text-sm">Client-side Encryption</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">IPFS</div>
              <div className="text-primary-foreground/70 text-sm">Decentralized Storage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-secondary" />
            <span className="text-2xl font-bold text-foreground">Sield</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/wallet-connect")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{headline}</h2>
              <p className="text-muted-foreground text-lg">{subtitle}</p>
            </div>

            <div className="flex bg-muted rounded-lg p-1 mb-6 border border-border">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "login"
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <Card className="border-0 shadow-none lg:shadow-lg lg:border">
              <CardContent className="p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, fullName: e.target.value }))
                          }
                          className={`h-12 ${
                            formData.fullName && formData.fullName.length >= 2 ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            formData.fullName && formData.fullName.length < 2 ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                          required
                        />
                        {/* Name validation indicator */}
                        {formData.fullName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {formData.fullName.length >= 2 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Name validation feedback */}
                      {formData.fullName && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {formData.fullName.length >= 2 ? 
                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          }
                          <span className={formData.fullName.length >= 2 ? "text-green-600" : "text-red-500"}>
                            {formData.fullName.length >= 2 ? "Name looks good" : "Name must be at least 2 characters"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, email: e.target.value }))
                        }
                        className={`h-12 ${
                          formData.email ? (
                            emailValidation.isValid ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            "border-red-300 focus:border-red-500 focus:ring-red-500"
                          ) : ""
                        }`}
                        required
                      />
                      {/* Email validation indicator */}
                      {formData.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailValidation.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Email validation feedback */}
                    {formData.email && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        {emailValidation.isValid ? 
                          <CheckCircle className="h-3 w-3 text-green-500" /> :
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        }
                        <span className={emailValidation.isValid ? "text-green-600" : "text-red-500"}>
                          {emailValidation.feedback}
                        </span>
                      </div>
                    )}
                    
                    {/* Email format tips */}
                    {formData.email && !emailValidation.isValid && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <p>• Email should include @ symbol</p>
                        <p>• Domain should include a dot (e.g., .com, .org)</p>
                        <p>• No spaces or special characters except . _ -</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, password: e.target.value }))
                        }
                        className={`h-12 pr-12 ${
                          mode === "signup" && formData.password ? (
                            passwordValidation.score >= 80 ? "border-green-300 focus:border-green-500 focus:ring-green-500" :
                            passwordValidation.score >= 60 ? "border-blue-300 focus:border-blue-500 focus:ring-blue-500" :
                            "border-red-300 focus:border-red-500 focus:ring-red-500"
                          ) : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator - Only show in signup mode */}
                    {mode === "signup" && formData.password && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
                          <Badge 
                            className={`text-xs ${
                              passwordValidation.score >= 80 ? "bg-green-100 text-green-800" :
                              passwordValidation.score >= 60 ? "bg-blue-100 text-blue-800" :
                              passwordValidation.score >= 40 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}
                          >
                            {passwordValidation.strength}
                          </Badge>
                        </div>
                        <Progress 
                          value={passwordValidation.score} 
                          className="h-2"
                        />
                        
                        {/* Password Requirements */}
                        <div className="grid grid-cols-1 gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.length ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.length ? "text-green-600" : "text-red-500"}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.uppercase ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.uppercase ? "text-green-600" : "text-red-500"}>
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.lowercase ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.lowercase ? "text-green-600" : "text-red-500"}>
                              One lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.numbers ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.numbers ? "text-green-600" : "text-red-500"}>
                              One number
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {passwordValidation.checks.special ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> :
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            }
                            <span className={passwordValidation.checks.special ? "text-green-600" : "text-red-500"}>
                              One special character
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className={`h-12 pr-12 ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword 
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
                              : ""
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          {formData.password === formData.confirmPassword ? 
                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          }
                          <span className={formData.password === formData.confirmPassword ? "text-green-600" : "text-red-500"}>
                            {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 mt-6 font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading || (mode === "signup" && (
                      !formData.email || 
                      !emailValidation.isValid ||
                      !formData.password || 
                      !formData.confirmPassword ||
                      !formData.fullName ||
                      formData.password !== formData.confirmPassword ||
                      passwordValidation.score < 60
                    )) || (mode === "login" && (
                      !formData.email ||
                      !emailValidation.isValid ||
                      !formData.password
                    ))}
                  >
                    {loading ? (
                      "Please wait..."
                    ) : mode === "login" ? (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {mode === "signup" && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
