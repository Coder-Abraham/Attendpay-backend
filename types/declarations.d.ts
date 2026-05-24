declare module 'lucide-react-native' {
  import * as React from 'react';
    import { SvgProps } from 'react-native-svg';

  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    fill?: string;
    strokeWidth?: number;
  }

  // Auth / Sign-up icons
  export const Hand: React.FC<LucideProps>;
  export const IdCard: React.FC<LucideProps>;
  export const Lightbulb: React.FC<LucideProps>;
  export const Unlock: React.FC<LucideProps>;
  export const Plus: React.FC<LucideProps>;
  export const Lock: React.FC<LucideProps>;
  export const PenTool: React.FC<LucideProps>;
  export const Key: React.FC<LucideProps>;
  export const CheckCircle: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;
  export const Mail: React.FC<LucideProps>;
  export const Check: React.FC<LucideProps>;
  export const Building2: React.FC<LucideProps>;
  export const Clipboard: React.FC<LucideProps>;
  export const Phone: React.FC<LucideProps>;
  export const ScanQrCode: React.FC<LucideProps>;
  export const ShieldAlert: React.FC<LucideProps>;
  export const ArrowLeft: React.FC<LucideProps>;
  export const Eye: React.FC<LucideProps>;
  export const EyeOff: React.FC<LucideProps>;

  export default React.ComponentType<LucideProps>;
}

// expo-router — build/index.d.ts is missing from the installed package;
// re-export the public surface we actually use so TypeScript is satisfied.
declare module 'expo-router' {
  import * as React from 'react';

  export type Href = string | { pathname: string; params?: Record<string, string> };

  export interface Router {
    push(href: Href): void;
    replace(href: Href): void;
    back(): void;
    canGoBack(): boolean;
  }

  export function useRouter(): Router;
  export function useLocalSearchParams<T extends Record<string, string> = Record<string, string>>(): T;
  export function useSegments(): string[];
  export function usePathname(): string;

  export interface LinkProps {
    href: Href;
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const Link: React.FC<LinkProps>;

  export interface StackProps {
    screenOptions?: Record<string, any>;
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const Stack: React.FC<StackProps> & {
    Screen: React.FC<{ name?: string; options?: Record<string, any> }>;
  };

  export const Slot: React.FC<{ [key: string]: any }>;
  export const Tabs: React.FC<{ [key: string]: any }> & {
    Screen: React.FC<{ name?: string; options?: Record<string, any> }>;
  };

  export function Redirect(props: { href: Href }): React.ReactElement;
}
