import { redirect } from "next/navigation";

// Home redirige a login
export default function HomeRoute() {
  redirect("/login");
}


