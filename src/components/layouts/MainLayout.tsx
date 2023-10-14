import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import SearchModal from '../shared/SearchModal';

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showCategoriesHeader?: boolean;
  showFooter?: boolean;
}

const Header = dynamic(() => import('../partials/Header'));
const Footer = dynamic(() => import('../partials/Footer'));
const Sidebar = dynamic(() => import('../partials/Sidebar'));

export default function MainLayout({
  showHeader,
  showFooter,
  showCategoriesHeader,
  children,
}: MainLayoutProps) {
  return (
    <div>
      <div
        className={`overflow-x-hidden bg-light-background text-gray-600 dark:bg-background_dark dark:text-white`}
      >
        <SearchModal />

        <Toaster toastOptions={{ duration: 3500 }} />

        {showHeader && <Header showCategories={showCategoriesHeader} />}

        <Sidebar />

        <main>{children}</main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
}
