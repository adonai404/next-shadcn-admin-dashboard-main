import Link from "next/link";

import { siX } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="min-w-0 px-4">
        <CardTitle className="truncate text-sm">Precisa de mais alguma coisa?</CardTitle>
        <CardDescription className="line-clamp-2">
          Abra uma issue ou entre em contato pelo&nbsp;
          <Link
            href="https://x.com/arhamkhnz"
            target="_blank"
            rel="noreferrer"
            aria-label="Entrar em contato pelo X"
            className="inline-flex items-center text-foreground"
          >
            <SimpleIcon icon={siX} aria-hidden className="size-3 fill-current" />
          </Link>
          .
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
