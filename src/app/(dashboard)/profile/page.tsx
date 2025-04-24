import { getProfile } from "@/actions/profile/get";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function EditProfilePage() {
  const { success, data, error } = await getProfile();

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

      {!success && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Erro ao carregar perfil"}
        </div>
      )}

      {success && data && <ProfileForm initialData={data} />}
    </div>
  );
}
