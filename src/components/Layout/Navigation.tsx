import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, CheckCircle, Settings, Moon, Sun, BarChart2, LogOut, User as UserIcon, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Navigation: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    // { to: '/', icon: Home, label: '今日概览', end: true },
    // { to: '/pool', icon: List, label: '任务池' },
    // { to: '/today', icon: CheckCircle, label: '今日计划' },
    // { to: '/analytics', icon: BarChart2, label: '统计分析' },
    // { to: '/settings', icon: Settings, label: '设置' },
    { to: '/', icon: Home, label: '今日概览', end: true },
    { to: '/pool', icon: List, label: '任务池', end: false },
    { to: '/today', icon: CheckCircle, label: '今日计划', end: false },
    { to: '/analytics', icon: BarChart2, label: '统计分析', end: false },
    { to: '/ai-chat', icon: MessageSquare, label: 'AI助手', end: false },
    { to: '/settings', icon: Settings, label: '设置', end: false },
 
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt={user?.name || user?.email || 'User'} />
                <AvatarFallback>{user?.name?.[0] || user?.email?.[0]}</AvatarFallback>
            </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || '用户'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>登出</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-gray-100">LearnFlow Pro</h1>
            </div>
          </div>

          {/* Desktop Navigation & User Controls */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="ml-4 flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation & User Controls */}
      <div className="md:hidden">
        <div className="border-t border-gray-100 dark:border-gray-700 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            {user && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt={user?.name || user?.email || 'User'} />
                    <AvatarFallback>{user?.name?.[0] || user?.email?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">{user.name || '用户'}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
