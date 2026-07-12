import { redirect } from "next/navigation"

export default function Home() {
  // Our middleware handles auth redirection, so we can just redirect to dashboard
  // which will get intercepted by middleware if not logged in.
  redirect("/dashboard")
}
