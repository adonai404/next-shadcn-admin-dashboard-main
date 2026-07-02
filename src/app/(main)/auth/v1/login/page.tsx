import Link from "next/link";

import { Command } from "lucide-react";

import { LoginForm } from "../../_components/login-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function LoginV1() {
  return (
    <div className="flex h-dvh">
      <div className="hidden bg-primary lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <Command className="mx-auto size-12 text-primary-foreground" />
            <div className="space-y-2">
              <h1 className="font-light text-5xl text-primary-foreground">Bem-vindo de volta</h1>
              <p className="text-primary-foreground/80 text-xl">Entre para continuar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="font-medium tracking-tight">Entrar</div>
            <div className="mx-auto max-w-xl text-muted-foreground">
              Bem-vindo de volta. Informe seu e-mail e senha — vamos torcer para você se lembrar deles dessa vez.
            </div>
          </div>
          <div className="space-y-4">
            <LoginForm />
            <GoogleButton className="w-full" variant="outline" />
            <p className="text-center text-muted-foreground text-xs">
              Ainda não tem uma conta?{" "}
              <Link prefetch={false} href="register" className="text-primary">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
