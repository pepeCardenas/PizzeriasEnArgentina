import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
}
