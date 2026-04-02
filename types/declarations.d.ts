declare module 'expo-router' {
  import * as React from 'react';
  export type Router = {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
    refresh: () => void;
  };

  export function useRouter(): Router;
  export function useSearchParams<T extends Record<string, any> = Record<string, string | undefined>>(): T;
  export function useLocalSearchParams<T extends Record<string, any> = Record<string, string | undefined>>(): T;

  export const Link: React.ComponentType<any>;
  export const Stack: React.ComponentType<any>;
  export const Tabs: React.ComponentType<any>;
  export default {
    useRouter,
    useSearchParams,
    useLocalSearchParams,
    Link,
    Stack,
    Tabs,
  };
}

declare module 'lucide-react-native' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    fill?: string;
  }

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

  export default React.ComponentType<LucideProps>;
}
