import { Fingerprint, type LucideIcon, MapPin, Package, Receipt, Truck, UploadCloud, Users } from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Notas Fiscais",
    items: [
      {
        id: "import",
        title: "Importação",
        url: "/dashboard/nfe-analysis/import",
        icon: UploadCloud,
      },
      {
        id: "overview",
        title: "Visão Geral",
        url: "/dashboard/nfe-analysis",
        icon: Receipt,
      },
      {
        id: "suppliers",
        title: "Fornecedores",
        url: "/dashboard/nfe-analysis/fornecedores",
        icon: Truck,
      },
      {
        id: "customers",
        title: "Clientes",
        url: "/dashboard/nfe-analysis/clientes",
        icon: Users,
      },
      {
        id: "products",
        title: "Produtos",
        url: "/dashboard/nfe-analysis/produtos",
        icon: Package,
      },
      {
        id: "states",
        title: "Por UF",
        url: "/dashboard/nfe-analysis/uf",
        icon: MapPin,
      },
    ],
  },
  {
    id: 2,
    label: "Páginas",
    items: [
      {
        id: "authentication",
        title: "Autenticação",
        icon: Fingerprint,
        subItems: [
          { id: "auth-login-v1", title: "Entrar v1", url: "/auth/v1/login", newTab: true },
          { id: "auth-login-v2", title: "Entrar v2", url: "/auth/v2/login", newTab: true },
          { id: "auth-register-v1", title: "Cadastro v1", url: "/auth/v1/register", newTab: true },
          { id: "auth-register-v2", title: "Cadastro v2", url: "/auth/v2/register", newTab: true },
        ],
      },
    ],
  },
];
