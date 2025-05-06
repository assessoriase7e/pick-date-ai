import { getProfile } from "@/actions/profile/get";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function EditProfilePage() {
  const { data } = await getProfile();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

      <ProfileForm initialData={data} />
    </div>
  );
}
