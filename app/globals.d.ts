declare module "*.css";

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": React.HTMLAttributes<HTMLElement>;
      "s-link": React.HTMLAttributes<HTMLElement> & { href?: string };
    }
  }
}
