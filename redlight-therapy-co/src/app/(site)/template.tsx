import PageMotion from "@/components/motion/PageMotion";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}
