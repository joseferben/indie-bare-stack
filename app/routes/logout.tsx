import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { services } from "~/services.server";

export async function action({ request }: ActionArgs) {
  return services.items.sessionService.destroy(request);
}

export async function loader() {
  return redirect("/");
}
