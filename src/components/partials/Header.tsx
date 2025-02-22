import SwitchTheme from '../buttons/SwitchTheme';
import Search from '../shared/Search';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import Menu from '../buttons/Menu';
import Categories from '~/components/partials/Categories';
import Cart from './Cart';

interface HeaderProps {
  showCategories?: boolean;
}

export default function Header({ showCategories = true }: HeaderProps) {
  return (
    <header className="mx-auto w-full px-4 py-4  md:max-w-[720px] lg:max-w-[1200px]">
      <nav className="flex min-h-[50px] w-full items-center justify-between">
        {/* left header  */}
        <div className="flex items-center space-x-6">
          <Menu />
          <Logo />
        </div>

        {/* desktop & tablet search bar  */}
        <div className="relative z-40 hidden h-fit md:block md:w-1/2">
          <Search />
        </div>

        {/* right header  */}
        <div className="flex items-center space-x-8 text-gray-600 dark:text-white">
          <Cart />

          <SwitchTheme />

          {/* <BellNotification /> */}

          <UserAvatar />
        </div>
      </nav>

      {showCategories && <Categories />}

      {/* mobile search bar */}
      {/* <div className="relative z-40 mx-auto mt-4 h-fit w-[95%] md:hidden">
        <Search />
      </div> */}
    </header>
  );
}
