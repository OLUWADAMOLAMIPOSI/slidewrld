export const metadata = {
  title: {
    default: "Admin",
    template: "%s | SlideWrld admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }) {
  return children;
}
