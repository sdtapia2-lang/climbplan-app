import { ErrorScreen } from "@/components/ErrorScreen";

export default function NotFound() {
  return (
    <ErrorScreen
      title="Esta página no existe"
      description="El enlace puede estar viejo, o el mesociclo o atleta que buscabas ya no está."
    />
  );
}
