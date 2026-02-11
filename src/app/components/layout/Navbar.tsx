import { Avatar, AvatarFallback } from '../ui/avatar';

interface NavbarProps {
  pageTitle: string;
}

export default function Navbar({ pageTitle }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">Admin User</p>
          <p className="text-xs text-gray-500">admin@hrms.com</p>
        </div>
        <Avatar className="w-10 h-10 border-2 border-indigo-100">
          <AvatarFallback className="bg-indigo-500 text-white">AU</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
