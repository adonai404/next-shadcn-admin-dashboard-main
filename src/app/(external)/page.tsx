import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/nfe-analysis");
  return <>Coming Soon</>;
}
