import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import Logo from "@/components/logo";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-1">
      {/* Logo sunucu tarafında render edilip client bileşene aktarılıyor */}
      <Sidebar
        user={user}
        logo={<Logo yukseklik={32} />}
        mobilLogo={<Logo yukseklik={28} />}
      />
      {/* mobilde sabit üst bar içeriğin üstüne binmesin diye pt-14 */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
