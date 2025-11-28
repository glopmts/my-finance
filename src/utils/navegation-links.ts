import { DollarSign, FolderOpen, Home } from "lucide-react";

export const linksNavegation = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Transações",
    href: "/transactions",
    icon: DollarSign,
  },
  // {
  //   label: "Upload Extrato",
  //   href: "/upload-extract",
  //   icon: Upload,
  // },
  {
    label: "Pastas Recorrentes",
    href: "/recurring-folders",
    icon: FolderOpen,
  },
];
