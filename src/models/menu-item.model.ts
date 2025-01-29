export interface MenuItem {
    label: string;
    icon: React.ReactNode | null;
    handler: (menuItem: MenuItem) => void;
    id: string;
    menuType: "default" | "custom";
  }