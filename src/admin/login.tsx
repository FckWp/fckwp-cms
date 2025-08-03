import type React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import pb from "@/lib/pb";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "adminLogin.validation.emailRequired" })
    .email({ message: "adminLogin.validation.emailInvalid" }),
  password: z
    .string()
    .nonempty({ message: "adminLogin.validation.passwordRequired" })
    .min(8, { message: "adminLogin.validation.passwordMin" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const authData = await pb
        .collection("_superusers")
        .authWithPassword(data.email, data.password);
      toast(t("adminLogin.success"));
      window.location.href = "/";
    } catch (err: any) {
      if (err?.data?.message || err?.message) {
        toast(t("adminLogin.errors.invalidCredentials"));
      } else if (err?.status === 0) {
        toast(t("adminLogin.errors.network"));
      } else {
        toast(t("adminLogin.errors.unknown"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "p-5 flex flex-col gap-6 mx-auto mt-32 max-w-[600px]",
        className
      )}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("adminLogin.title")}</CardTitle>
          <CardDescription>{t("adminLogin.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("adminLogin.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {t(errors.email.message as string)}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t("adminLogin.password")}</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("adminLogin.forgotPassword")}
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...register("password")}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {t(errors.password.message as string)}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>{t("adminLogin.login")}</span>
                    </div>
                  ) : (
                    t("adminLogin.login")
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
